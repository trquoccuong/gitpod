/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { RepositoryService } from "../../../src/repohost/repo-service";
import { ProviderRepository, User } from "@gitpod/gitpod-protocol";
import { inject, injectable } from "inversify";
import { BitbucketServerApi, BitbucketServer } from "../../../src/bitbucket-server/bitbucket-server-api";
import { AuthProviderParams } from "../../../src/auth/auth-provider";
import { BitbucketServerContextParser } from "../../../src/bitbucket-server/bitbucket-server-context-parser";
import { Config } from "../../../src/config";
import { TokenService } from "../../../src/user/token-service";
import { BitbucketServerApp } from "./bitbucket-server-app";

@injectable()
export class BitbucketServerService extends RepositoryService {
    static PREBUILD_TOKEN_SCOPE = "prebuilds";

    @inject(BitbucketServerApi) protected api: BitbucketServerApi;
    @inject(Config) protected readonly config: Config;
    @inject(AuthProviderParams) protected authProviderConfig: AuthProviderParams;
    @inject(TokenService) protected tokenService: TokenService;
    @inject(BitbucketServerContextParser) protected contextParser: BitbucketServerContextParser;

    async getRepositoriesForAutomatedPrebuilds(user: User): Promise<ProviderRepository[]> {
        const repos = await this.api.getRepos(user, { limit: 100, permission: "REPO_ADMIN" });
        return (repos.values || []).map((r) => {
            const cloneUrl = r.links.clone.find((u) => u.name === "http")?.href!;
            // const webUrl = r.links?.self[0]?.href?.replace("/browse", "");
            const accountAvatarUrl = this.api.getAvatarUrl(r.project.key);
            return <ProviderRepository>{
                name: r.name,
                cloneUrl,
                account: r.project.key,
                accountAvatarUrl,
                // updatedAt: TODO(at): this isn't provided directly
            };
        });
    }

    async canInstallAutomatedPrebuilds(user: User, cloneUrl: string): Promise<boolean> {
        const { host, repoKind, owner, repoName } = await this.contextParser.parseURL(user, cloneUrl);
        if (host !== this.authProviderConfig.host) {
            return false;
        }

        const identity = user.identities.find((i) => i.authProviderId === this.authProviderConfig.id);
        if (!identity) {
            console.error(
                `Unexpected call of canInstallAutomatedPrebuilds. Not authorized with ${this.authProviderConfig.host}.`,
            );
            return false;
        }

        try {
            await this.api.getWebhooks(user, { repoKind, repositorySlug: repoName, owner });
            // reading webhooks to check if admin scope is provided
        } catch (error) {
            return false;
        }

        const permissions = await this.api.runQuery<BitbucketServer.Paginated<BitbucketServer.PermissionEntry>>(
            user,
            `/${repoKind}/${owner}/repos/${repoName}/permissions/users`,
        );
        const ownPermission = permissions.values?.find((p) => p.user.slug === identity?.authName)?.permission;
        if (ownPermission === "REPO_ADMIN") {
            return true;
        }

        console.debug(
            `User is not allowed to install webhooks.\n${JSON.stringify(identity)}\n${JSON.stringify(permissions)}`,
        );
        return false;
    }

    async installAutomatedPrebuilds(user: User, cloneUrl: string): Promise<void> {
        const { owner, repoName, repoKind } = await this.contextParser.parseURL(user, cloneUrl);

        const existing = await this.api.getWebhooks(user, {
            repoKind,
            repositorySlug: repoName,
            owner,
        });
        const hookUrl = this.getHookUrl();
        if (existing.values && existing.values.some((hook) => hook.url && hook.url.indexOf(hookUrl) !== -1)) {
            console.log(`BBS webhook already installed on ${cloneUrl}`);
            return;
        }
        const tokenEntry = await this.tokenService.createGitpodToken(
            user,
            BitbucketServerService.PREBUILD_TOKEN_SCOPE,
            cloneUrl,
        );
        try {
            await this.api.setWebhook(
                user,
                { repoKind, repositorySlug: repoName, owner },
                {
                    name: `Gitpod Prebuilds for ${this.config.hostUrl}.`,
                    active: true,
                    configuration: {
                        secret: "foobar123-secret",
                    },
                    url: hookUrl + `?token=${encodeURIComponent(user.id + "|" + tokenEntry.token.value)}`,
                    events: ["repo:refs_changed"],
                },
            );
            console.log("Installed Bitbucket Server Webhook for " + cloneUrl);
        } catch (error) {
            console.error(`Couldn't install Bitbucket Server Webhook for ${cloneUrl}`, error);
        }
    }

    protected getHookUrl() {
        return this.config.hostUrl
            .with({
                pathname: BitbucketServerApp.path,
            })
            .toString();
    }
}
