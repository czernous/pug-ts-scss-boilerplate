/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');

const src = path.resolve('./src');

const pages_path = path.resolve(src, 'pages/');
const __pages: any[] = [];

fs.readdirSync(pages_path).forEach((fullName: string) => {
  __pages.push({
    href: `${fullName}.html`,
    name: fullName,
  });
});

const icon_path = path.resolve(src, 'icons');
const __svgIcon: any[] = [];

fs.readdirSync(icon_path).forEach((fullName: string) => {
  const ext = path.extname(fullName);

  if (ext === '.svg') {
    const name = fullName.slice(0, -ext.length);

    __svgIcon.push({
      name,
    });
  }
});

const pugData = { ...{ __pages }, ...{ __svgIcon } };

export default pugData;
