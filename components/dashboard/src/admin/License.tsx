/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { PageWithSubMenu } from "../components/PageWithSubMenu";
import { adminMenu } from "./admin-menu";

export default function License() {
    return (
        <div>
            <PageWithSubMenu
                subMenu={adminMenu}
                title="License"
                subtitle="License information of your account."
            >
            <h3>License creation</h3>
            </PageWithSubMenu>
        </div>
    );
}
