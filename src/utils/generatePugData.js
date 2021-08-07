const fs = require('fs');
const path = require('path');

const src = path.resolve('./src');
let pugData = {};

const pages_path = path.resolve(src, 'pages/');
let __pages = [];

fs.readdirSync(pages_path).forEach((fullName) => {
  __pages.push({
    href: `${fullName}.html`,
    name: fullName,
  });
});

const icon_path = path.resolve(src, 'svg');
let __svgIcon = [];

// fs.readdirSync(icon_path).forEach((fullName) => {
//   const ext = path.extname(fullName);

//   if (ext === '.svg') {
//     const name = fullName.slice(0, -ext.length);

//     __svgIcon.push({
//       name,
//     });
//   }
// });

pugData = { ...pugData, ...{ __pages }, ...{ __svgIcon } };

module.exports = pugData;
