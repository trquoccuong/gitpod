/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { useContext } from "react";
import { AdminContext } from "../admin-context";
import { PageWithSubMenu } from "../components/PageWithSubMenu";
import { adminMenu } from "./admin-menu";
import { UserContext } from "../user-context";

export default function License() {
    const { adminSettings, setAdminSettings } = useContext(AdminContext);
    const { user } = useContext(UserContext);

    return (
        <div>
            <PageWithSubMenu>
                subMenu={adminMenu}
                title="License"
                subtitle="License information of your account."
            </PageWithSubMenu>
        </div>
    );
}
