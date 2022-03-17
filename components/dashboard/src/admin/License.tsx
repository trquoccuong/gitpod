/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { PageWithSubMenu } from "../components/PageWithSubMenu";
import { adminMenu } from "./admin-menu";
import { LicenseService } from "@gitpod/gitpod-protocol/lib/license-protocol";
import { useContext, useState } from "react";
import { UserContext } from "../user-context";

export default function License() {
    // @ts-ignore
    const { user } = useContext(UserContext);
    // @ts-ignore
    const [license, setLicense] = useState<LicenseService>();
    // @ts-ignore
    const test = user?.creationDate || new Date().toISOString()
    return (
        <div>
            <PageWithSubMenu
                subMenu={adminMenu}
                title="License"
                subtitle="License information of your account."
            >
                {!!license && (
                <>
                    <h3>license</h3>
                    <h3>setLicense</h3>
                </>
                )}
                <p>test</p>
            </PageWithSubMenu>
        </div>
    );
}
