/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
const GITPOD_HOST = "ide2.snapbrillia.com";

module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  devServer: {
    proxy: {
        '/api': {
            target: 'https://' + GITPOD_HOST,
            ws: true,
            changeOrigin: true,
            headers: {
                host: GITPOD_HOST,
                origin: 'https://' + GITPOD_HOST,
                cookie: 's%3A90bc5677-fb54-4ddd-abac-7d5b04135820.VUnm9%2FbohwJyxp4joPXhE%2BeClLgY7tWIxyxBs5V8MP8'
            },
        }
    }
  }
};
