module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-sass-guidelines',
    'stylelint-prettier/recommended',
  ],
  rules: {
    'no-descending-specificity': null,
    'selector-max-compound-selectors': null,
    'order/properties-alphabetical-order': null,
    'max-nesting-depth': null,
    'selector-no-qualifying-type': null,
    'declaration-property-value-disallowed-list': null,
    'selector-no-qualifying-type': null,
  },
};
