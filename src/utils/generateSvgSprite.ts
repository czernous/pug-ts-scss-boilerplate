/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const glob = require('glob');
const SVGSpriter = require('svg-sprite');

const generateSvgSprite = () => {
  const config = {
    dest: './dist/',
    mode: {
      symbol: true,
    },
  };

  const spriter = new SVGSpriter(config);
  const svgPaths = glob.sync('./src/icons/*.svg', { absolute: true });

  svgPaths.forEach((svgPath) => {
    spriter.add(svgPath, null, fs.readFileSync(svgPath, { encoding: 'utf-8' }));
  });

  spriter.compile((error, result) => {
    const symbolSprite = result.symbol.sprite;

    fs.writeFileSync('./src/common/sprite.svg', symbolSprite.contents);

    console.log('======== SVG sprite created!');
  });
};

generateSvgSprite();
