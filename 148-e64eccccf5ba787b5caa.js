"use strict";
(self["webpackChunkdata_science_editor"] = self["webpackChunkdata_science_editor"] || []).push([[148],{

/***/ 4148:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ JSONSchemaForm; }
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(7294);
// EXTERNAL MODULE: ./node_modules/@mui/material/Grid/Grid.js + 2 modules
var Grid = __webpack_require__(5725);
// EXTERNAL MODULE: ./node_modules/@mui/material/TextField/TextField.js + 34 modules
var TextField = __webpack_require__(8361);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(3366);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/extends.js
var esm_extends = __webpack_require__(7462);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.m.js
var clsx_m = __webpack_require__(6010);
// EXTERNAL MODULE: ./node_modules/@mui/utils/esm/composeClasses/composeClasses.js
var composeClasses = __webpack_require__(4780);
// EXTERNAL MODULE: ./node_modules/@mui/material/FormControl/useFormControl.js
var useFormControl = __webpack_require__(4423);
// EXTERNAL MODULE: ./node_modules/@mui/material/Typography/Typography.js + 1 modules
var Typography = __webpack_require__(2658);
// EXTERNAL MODULE: ./node_modules/@mui/material/utils/capitalize.js
var capitalize = __webpack_require__(8216);
// EXTERNAL MODULE: ./node_modules/@mui/material/styles/styled.js
var styled = __webpack_require__(948);
// EXTERNAL MODULE: ./node_modules/@mui/material/styles/useThemeProps.js
var useThemeProps = __webpack_require__(1657);
// EXTERNAL MODULE: ./node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js
var generateUtilityClasses = __webpack_require__(1588);
// EXTERNAL MODULE: ./node_modules/@mui/utils/esm/generateUtilityClass/generateUtilityClass.js
var generateUtilityClass = __webpack_require__(4867);
;// CONCATENATED MODULE: ./node_modules/@mui/material/FormControlLabel/formControlLabelClasses.js


function getFormControlLabelUtilityClasses(slot) {
  return (0,generateUtilityClass/* default */.Z)('MuiFormControlLabel', slot);
}
const formControlLabelClasses = (0,generateUtilityClasses/* default */.Z)('MuiFormControlLabel', ['root', 'labelPlacementStart', 'labelPlacementTop', 'labelPlacementBottom', 'disabled', 'label', 'error']);
/* harmony default export */ var FormControlLabel_formControlLabelClasses = (formControlLabelClasses);
// EXTERNAL MODULE: ./node_modules/@mui/material/FormControl/formControlState.js
var formControlState = __webpack_require__(5704);
// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5893);
;// CONCATENATED MODULE: ./node_modules/@mui/material/FormControlLabel/FormControlLabel.js


const _excluded = ["checked", "className", "componentsProps", "control", "disabled", "disableTypography", "inputRef", "label", "labelPlacement", "name", "onChange", "slotProps", "value"];














const useUtilityClasses = ownerState => {
  const {
    classes,
    disabled,
    labelPlacement,
    error
  } = ownerState;
  const slots = {
    root: ['root', disabled && 'disabled', `labelPlacement${(0,capitalize/* default */.Z)(labelPlacement)}`, error && 'error'],
    label: ['label', disabled && 'disabled']
  };
  return (0,composeClasses/* default */.Z)(slots, getFormControlLabelUtilityClasses, classes);
};
const FormControlLabelRoot = (0,styled/* default */.ZP)('label', {
  name: 'MuiFormControlLabel',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${FormControlLabel_formControlLabelClasses.label}`]: styles.label
    }, styles.root, styles[`labelPlacement${(0,capitalize/* default */.Z)(ownerState.labelPlacement)}`]];
  }
})(({
  theme,
  ownerState
}) => (0,esm_extends/* default */.Z)({
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  // For correct alignment with the text.
  verticalAlign: 'middle',
  WebkitTapHighlightColor: 'transparent',
  marginLeft: -11,
  marginRight: 16,
  // used for row presentation of radio/checkbox
  [`&.${FormControlLabel_formControlLabelClasses.disabled}`]: {
    cursor: 'default'
  }
}, ownerState.labelPlacement === 'start' && {
  flexDirection: 'row-reverse',
  marginLeft: 16,
  // used for row presentation of radio/checkbox
  marginRight: -11
}, ownerState.labelPlacement === 'top' && {
  flexDirection: 'column-reverse',
  marginLeft: 16
}, ownerState.labelPlacement === 'bottom' && {
  flexDirection: 'column',
  marginLeft: 16
}, {
  [`& .${FormControlLabel_formControlLabelClasses.label}`]: {
    [`&.${FormControlLabel_formControlLabelClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled
    }
  }
}));

/**
 * Drop-in replacement of the `Radio`, `Switch` and `Checkbox` component.
 * Use this component if you want to display an extra label.
 */
const FormControlLabel = /*#__PURE__*/react.forwardRef(function FormControlLabel(inProps, ref) {
  var _slotProps$typography;
  const props = (0,useThemeProps/* default */.Z)({
    props: inProps,
    name: 'MuiFormControlLabel'
  });
  const {
      className,
      componentsProps = {},
      control,
      disabled: disabledProp,
      disableTypography,
      label: labelProp,
      labelPlacement = 'end',
      slotProps = {}
    } = props,
    other = (0,objectWithoutPropertiesLoose/* default */.Z)(props, _excluded);
  const muiFormControl = (0,useFormControl/* default */.Z)();
  let disabled = disabledProp;
  if (typeof disabled === 'undefined' && typeof control.props.disabled !== 'undefined') {
    disabled = control.props.disabled;
  }
  if (typeof disabled === 'undefined' && muiFormControl) {
    disabled = muiFormControl.disabled;
  }
  const controlProps = {
    disabled
  };
  ['checked', 'name', 'onChange', 'value', 'inputRef'].forEach(key => {
    if (typeof control.props[key] === 'undefined' && typeof props[key] !== 'undefined') {
      controlProps[key] = props[key];
    }
  });
  const fcs = (0,formControlState/* default */.Z)({
    props,
    muiFormControl,
    states: ['error']
  });
  const ownerState = (0,esm_extends/* default */.Z)({}, props, {
    disabled,
    labelPlacement,
    error: fcs.error
  });
  const classes = useUtilityClasses(ownerState);
  const typographySlotProps = (_slotProps$typography = slotProps.typography) != null ? _slotProps$typography : componentsProps.typography;
  let label = labelProp;
  if (label != null && label.type !== Typography/* default */.Z && !disableTypography) {
    label = /*#__PURE__*/(0,jsx_runtime.jsx)(Typography/* default */.Z, (0,esm_extends/* default */.Z)({
      component: "span"
    }, typographySlotProps, {
      className: (0,clsx_m/* default */.Z)(classes.label, typographySlotProps == null ? void 0 : typographySlotProps.className),
      children: label
    }));
  }
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(FormControlLabelRoot, (0,esm_extends/* default */.Z)({
    className: (0,clsx_m/* default */.Z)(classes.root, className),
    ownerState: ownerState,
    ref: ref
  }, other, {
    children: [/*#__PURE__*/react.cloneElement(control, controlProps), label]
  }));
});
 false ? 0 : void 0;
/* harmony default export */ var FormControlLabel_FormControlLabel = (FormControlLabel);
// EXTERNAL MODULE: ./node_modules/@mui/system/esm/colorManipulator.js
var colorManipulator = __webpack_require__(1796);
// EXTERNAL MODULE: ./node_modules/@mui/material/utils/useControlled.js + 1 modules
var useControlled = __webpack_require__(2893);
// EXTERNAL MODULE: ./node_modules/@mui/material/ButtonBase/ButtonBase.js + 6 modules
var ButtonBase = __webpack_require__(6637);
;// CONCATENATED MODULE: ./node_modules/@mui/material/internal/switchBaseClasses.js


function getSwitchBaseUtilityClass(slot) {
  return (0,generateUtilityClass/* default */.Z)('PrivateSwitchBase', slot);
}
const switchBaseClasses = (0,generateUtilityClasses/* default */.Z)('PrivateSwitchBase', ['root', 'checked', 'disabled', 'input', 'edgeStart', 'edgeEnd']);
/* harmony default export */ var internal_switchBaseClasses = ((/* unused pure expression or super */ null && (switchBaseClasses)));
;// CONCATENATED MODULE: ./node_modules/@mui/material/internal/SwitchBase.js


const SwitchBase_excluded = ["autoFocus", "checked", "checkedIcon", "className", "defaultChecked", "disabled", "disableFocusRipple", "edge", "icon", "id", "inputProps", "inputRef", "name", "onBlur", "onChange", "onFocus", "readOnly", "required", "tabIndex", "type", "value"];













const SwitchBase_useUtilityClasses = ownerState => {
  const {
    classes,
    checked,
    disabled,
    edge
  } = ownerState;
  const slots = {
    root: ['root', checked && 'checked', disabled && 'disabled', edge && `edge${(0,capitalize/* default */.Z)(edge)}`],
    input: ['input']
  };
  return (0,composeClasses/* default */.Z)(slots, getSwitchBaseUtilityClass, classes);
};
const SwitchBaseRoot = (0,styled/* default */.ZP)(ButtonBase/* default */.Z)(({
  ownerState
}) => (0,esm_extends/* default */.Z)({
  padding: 9,
  borderRadius: '50%'
}, ownerState.edge === 'start' && {
  marginLeft: ownerState.size === 'small' ? -3 : -12
}, ownerState.edge === 'end' && {
  marginRight: ownerState.size === 'small' ? -3 : -12
}));
const SwitchBaseInput = (0,styled/* default */.ZP)('input')({
  cursor: 'inherit',
  position: 'absolute',
  opacity: 0,
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  margin: 0,
  padding: 0,
  zIndex: 1
});

/**
 * @ignore - internal component.
 */
const SwitchBase = /*#__PURE__*/react.forwardRef(function SwitchBase(props, ref) {
  const {
      autoFocus,
      checked: checkedProp,
      checkedIcon,
      className,
      defaultChecked,
      disabled: disabledProp,
      disableFocusRipple = false,
      edge = false,
      icon,
      id,
      inputProps,
      inputRef,
      name,
      onBlur,
      onChange,
      onFocus,
      readOnly,
      required,
      tabIndex,
      type,
      value
    } = props,
    other = (0,objectWithoutPropertiesLoose/* default */.Z)(props, SwitchBase_excluded);
  const [checked, setCheckedState] = (0,useControlled/* default */.Z)({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: 'SwitchBase',
    state: 'checked'
  });
  const muiFormControl = (0,useFormControl/* default */.Z)();
  const handleFocus = event => {
    if (onFocus) {
      onFocus(event);
    }
    if (muiFormControl && muiFormControl.onFocus) {
      muiFormControl.onFocus(event);
    }
  };
  const handleBlur = event => {
    if (onBlur) {
      onBlur(event);
    }
    if (muiFormControl && muiFormControl.onBlur) {
      muiFormControl.onBlur(event);
    }
  };
  const handleInputChange = event => {
    // Workaround for https://github.com/facebook/react/issues/9023
    if (event.nativeEvent.defaultPrevented) {
      return;
    }
    const newChecked = event.target.checked;
    setCheckedState(newChecked);
    if (onChange) {
      // TODO v6: remove the second argument.
      onChange(event, newChecked);
    }
  };
  let disabled = disabledProp;
  if (muiFormControl) {
    if (typeof disabled === 'undefined') {
      disabled = muiFormControl.disabled;
    }
  }
  const hasLabelFor = type === 'checkbox' || type === 'radio';
  const ownerState = (0,esm_extends/* default */.Z)({}, props, {
    checked,
    disabled,
    disableFocusRipple,
    edge
  });
  const classes = SwitchBase_useUtilityClasses(ownerState);
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchBaseRoot, (0,esm_extends/* default */.Z)({
    component: "span",
    className: (0,clsx_m/* default */.Z)(classes.root, className),
    centerRipple: true,
    focusRipple: !disableFocusRipple,
    disabled: disabled,
    tabIndex: null,
    role: undefined,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ownerState: ownerState,
    ref: ref
  }, other, {
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SwitchBaseInput, (0,esm_extends/* default */.Z)({
      autoFocus: autoFocus,
      checked: checkedProp,
      defaultChecked: defaultChecked,
      className: classes.input,
      disabled: disabled,
      id: hasLabelFor && id,
      name: name,
      onChange: handleInputChange,
      readOnly: readOnly,
      ref: inputRef,
      required: required,
      ownerState: ownerState,
      tabIndex: tabIndex,
      type: type
    }, type === 'checkbox' && value === undefined ? {} : {
      value
    }, inputProps)), checked ? checkedIcon : icon]
  }));
});

// NB: If changed, please update Checkbox, Switch and Radio
// so that the API documentation is updated.
 false ? 0 : void 0;
/* harmony default export */ var internal_SwitchBase = (SwitchBase);
;// CONCATENATED MODULE: ./node_modules/@mui/material/Switch/switchClasses.js


function getSwitchUtilityClass(slot) {
  return (0,generateUtilityClass/* default */.Z)('MuiSwitch', slot);
}
const switchClasses = (0,generateUtilityClasses/* default */.Z)('MuiSwitch', ['root', 'edgeStart', 'edgeEnd', 'switchBase', 'colorPrimary', 'colorSecondary', 'sizeSmall', 'sizeMedium', 'checked', 'disabled', 'input', 'thumb', 'track']);
/* harmony default export */ var Switch_switchClasses = (switchClasses);
;// CONCATENATED MODULE: ./node_modules/@mui/material/Switch/Switch.js


const Switch_excluded = ["className", "color", "edge", "size", "sx"];
// @inheritedComponent IconButton













const Switch_useUtilityClasses = ownerState => {
  const {
    classes,
    edge,
    size,
    color,
    checked,
    disabled
  } = ownerState;
  const slots = {
    root: ['root', edge && `edge${(0,capitalize/* default */.Z)(edge)}`, `size${(0,capitalize/* default */.Z)(size)}`],
    switchBase: ['switchBase', `color${(0,capitalize/* default */.Z)(color)}`, checked && 'checked', disabled && 'disabled'],
    thumb: ['thumb'],
    track: ['track'],
    input: ['input']
  };
  const composedClasses = (0,composeClasses/* default */.Z)(slots, getSwitchUtilityClass, classes);
  return (0,esm_extends/* default */.Z)({}, classes, composedClasses);
};
const SwitchRoot = (0,styled/* default */.ZP)('span', {
  name: 'MuiSwitch',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.edge && styles[`edge${(0,capitalize/* default */.Z)(ownerState.edge)}`], styles[`size${(0,capitalize/* default */.Z)(ownerState.size)}`]];
  }
})(({
  ownerState
}) => (0,esm_extends/* default */.Z)({
  display: 'inline-flex',
  width: 34 + 12 * 2,
  height: 14 + 12 * 2,
  overflow: 'hidden',
  padding: 12,
  boxSizing: 'border-box',
  position: 'relative',
  flexShrink: 0,
  zIndex: 0,
  // Reset the stacking context.
  verticalAlign: 'middle',
  // For correct alignment with the text.
  '@media print': {
    colorAdjust: 'exact'
  }
}, ownerState.edge === 'start' && {
  marginLeft: -8
}, ownerState.edge === 'end' && {
  marginRight: -8
}, ownerState.size === 'small' && {
  width: 40,
  height: 24,
  padding: 7,
  [`& .${Switch_switchClasses.thumb}`]: {
    width: 16,
    height: 16
  },
  [`& .${Switch_switchClasses.switchBase}`]: {
    padding: 4,
    [`&.${Switch_switchClasses.checked}`]: {
      transform: 'translateX(16px)'
    }
  }
}));
const SwitchSwitchBase = (0,styled/* default */.ZP)(internal_SwitchBase, {
  name: 'MuiSwitch',
  slot: 'SwitchBase',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.switchBase, {
      [`& .${Switch_switchClasses.input}`]: styles.input
    }, ownerState.color !== 'default' && styles[`color${(0,capitalize/* default */.Z)(ownerState.color)}`]];
  }
})(({
  theme
}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  // Render above the focus ripple.
  color: theme.vars ? theme.vars.palette.Switch.defaultColor : `${theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[300]}`,
  transition: theme.transitions.create(['left', 'transform'], {
    duration: theme.transitions.duration.shortest
  }),
  [`&.${Switch_switchClasses.checked}`]: {
    transform: 'translateX(20px)'
  },
  [`&.${Switch_switchClasses.disabled}`]: {
    color: theme.vars ? theme.vars.palette.Switch.defaultDisabledColor : `${theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]}`
  },
  [`&.${Switch_switchClasses.checked} + .${Switch_switchClasses.track}`]: {
    opacity: 0.5
  },
  [`&.${Switch_switchClasses.disabled} + .${Switch_switchClasses.track}`]: {
    opacity: theme.vars ? theme.vars.opacity.switchTrackDisabled : `${theme.palette.mode === 'light' ? 0.12 : 0.2}`
  },
  [`& .${Switch_switchClasses.input}`]: {
    left: '-100%',
    width: '300%'
  }
}), ({
  theme,
  ownerState
}) => (0,esm_extends/* default */.Z)({
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0,colorManipulator/* alpha */.Fq)(theme.palette.action.active, theme.palette.action.hoverOpacity),
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent'
    }
  }
}, ownerState.color !== 'default' && {
  [`&.${Switch_switchClasses.checked}`]: {
    color: (theme.vars || theme).palette[ownerState.color].main,
    '&:hover': {
      backgroundColor: theme.vars ? `rgba(${theme.vars.palette[ownerState.color].mainChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0,colorManipulator/* alpha */.Fq)(theme.palette[ownerState.color].main, theme.palette.action.hoverOpacity),
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    },
    [`&.${Switch_switchClasses.disabled}`]: {
      color: theme.vars ? theme.vars.palette.Switch[`${ownerState.color}DisabledColor`] : `${theme.palette.mode === 'light' ? (0,colorManipulator/* lighten */.$n)(theme.palette[ownerState.color].main, 0.62) : (0,colorManipulator/* darken */._j)(theme.palette[ownerState.color].main, 0.55)}`
    }
  },
  [`&.${Switch_switchClasses.checked} + .${Switch_switchClasses.track}`]: {
    backgroundColor: (theme.vars || theme).palette[ownerState.color].main
  }
}));
const SwitchTrack = (0,styled/* default */.ZP)('span', {
  name: 'MuiSwitch',
  slot: 'Track',
  overridesResolver: (props, styles) => styles.track
})(({
  theme
}) => ({
  height: '100%',
  width: '100%',
  borderRadius: 14 / 2,
  zIndex: -1,
  transition: theme.transitions.create(['opacity', 'background-color'], {
    duration: theme.transitions.duration.shortest
  }),
  backgroundColor: theme.vars ? theme.vars.palette.common.onBackground : `${theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white}`,
  opacity: theme.vars ? theme.vars.opacity.switchTrack : `${theme.palette.mode === 'light' ? 0.38 : 0.3}`
}));
const SwitchThumb = (0,styled/* default */.ZP)('span', {
  name: 'MuiSwitch',
  slot: 'Thumb',
  overridesResolver: (props, styles) => styles.thumb
})(({
  theme
}) => ({
  boxShadow: (theme.vars || theme).shadows[1],
  backgroundColor: 'currentColor',
  width: 20,
  height: 20,
  borderRadius: '50%'
}));
const Switch = /*#__PURE__*/react.forwardRef(function Switch(inProps, ref) {
  const props = (0,useThemeProps/* default */.Z)({
    props: inProps,
    name: 'MuiSwitch'
  });
  const {
      className,
      color = 'primary',
      edge = false,
      size = 'medium',
      sx
    } = props,
    other = (0,objectWithoutPropertiesLoose/* default */.Z)(props, Switch_excluded);
  const ownerState = (0,esm_extends/* default */.Z)({}, props, {
    color,
    edge,
    size
  });
  const classes = Switch_useUtilityClasses(ownerState);
  const icon = /*#__PURE__*/(0,jsx_runtime.jsx)(SwitchThumb, {
    className: classes.thumb,
    ownerState: ownerState
  });
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(SwitchRoot, {
    className: (0,clsx_m/* default */.Z)(classes.root, className),
    sx: sx,
    ownerState: ownerState,
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(SwitchSwitchBase, (0,esm_extends/* default */.Z)({
      type: "checkbox",
      icon: icon,
      checkedIcon: icon,
      ref: ref,
      ownerState: ownerState
    }, other, {
      classes: (0,esm_extends/* default */.Z)({}, classes, {
        root: classes.switchBase
      })
    })), /*#__PURE__*/(0,jsx_runtime.jsx)(SwitchTrack, {
      className: classes.track,
      ownerState: ownerState
    })]
  });
});
 false ? 0 : void 0;
/* harmony default export */ var Switch_Switch = (Switch);
;// CONCATENATED MODULE: ./src/components/ui/SwitchWithLabel.tsx
var SwitchWithLabel_excluded=["label","labelPlacement","labelStyle"];function SwitchWithLabel(props){var{label,labelPlacement,labelStyle}=props,rest=(0,objectWithoutPropertiesLoose/* default */.Z)(props,SwitchWithLabel_excluded);return/*#__PURE__*/react.createElement(FormControlLabel_FormControlLabel,{control:/*#__PURE__*/react.createElement(Switch_Switch,rest),label:label,style:labelStyle,labelPlacement:labelPlacement});}
// EXTERNAL MODULE: ./node_modules/@mui/material/Box/Box.js + 1 modules
var Box = __webpack_require__(1508);
// EXTERNAL MODULE: ./node_modules/@mui/material/Chip/Chip.js + 2 modules
var Chip = __webpack_require__(461);
;// CONCATENATED MODULE: ./src/components/ui/GridHeader.tsx
var PREFIX="GridHeader";var classes={hr:PREFIX+"hr",start:PREFIX+"start"};var StyledGrid=(0,styled/* default */.ZP)(Grid/* default */.ZP)(_ref=>{var{theme}=_ref;return{["& ."+classes.hr]:{background:theme.palette.text.disabled,marginBottom:"unset"},["& ."+classes.start]:{width:theme.spacing(2)}};});function GridHeader(props){var{title,count,variant,action}=props;return/*#__PURE__*/react.createElement(StyledGrid,{item:true,xs:12},/*#__PURE__*/react.createElement(Grid/* default */.ZP,{container:true,direction:"row",spacing:1,justifyContent:"center",alignItems:"center"},/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true},/*#__PURE__*/react.createElement("hr",{className:(0,clsx_m/* default */.Z)(classes.hr,classes.start)})),/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true},action&&/*#__PURE__*/react.createElement(Box/* default */.Z,{component:"span",mr:1},action),/*#__PURE__*/react.createElement(Typography/* default */.Z,{component:"span",variant:variant||"subtitle1"},title),count!==undefined&&/*#__PURE__*/react.createElement(Box/* default */.Z,{component:"span",ml:0.5},/*#__PURE__*/react.createElement(Chip/* default */.Z,{label:count}))),/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true,xs:true},/*#__PURE__*/react.createElement("hr",{className:classes.hr}))));}
;// CONCATENATED MODULE: ./src/components/blockly/fields/JSONSchemaForm.tsx
/* eslint-disable @typescript-eslint/ban-types */function SchemaForm(props){var{schema,required,value,setValue}=props;var{type,title,description}=schema;var id=(0,react.useId)();var handleChange=event=>{setValue(event.target.value||"");};var handleNumberChange=event=>{var v=parseFloat(event.target.value);if(!isNaN(v))setValue(v);};var handleIntegerChange=event=>{var v=parseInt(event.target.value);if(!isNaN(v))setValue(v);};var handleCheckedChange=(event,checked)=>{setValue(checked);};switch(type){case"number":return/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true,xs:12},/*#__PURE__*/react.createElement(TextField/* default */.Z,{id:id,label:title,required:required,helperText:description,variant:"outlined",type:"number",value:value,fullWidth:true,onChange:handleNumberChange}));case"integer":return/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true,xs:12},/*#__PURE__*/react.createElement(TextField/* default */.Z,{id:id,label:title,required:required,helperText:description,variant:"outlined",type:"number",value:value,fullWidth:true,onChange:handleIntegerChange}));case"string":return/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true,xs:12},/*#__PURE__*/react.createElement(TextField/* default */.Z,{id:id,label:title,required:required,helperText:description,variant:"outlined",type:"text",value:value,fullWidth:true,onChange:handleChange}));case"boolean":return/*#__PURE__*/react.createElement(Grid/* default */.ZP,{item:true,xs:12},/*#__PURE__*/react.createElement(SwitchWithLabel,{id:id,required:required,label:title,title:description,checked:!!value,onChange:handleCheckedChange}));case"object":{var{properties,required:_required}=schema;return/*#__PURE__*/react.createElement(react.Fragment,null,title&&/*#__PURE__*/react.createElement(GridHeader,{title:title}),/*#__PURE__*/react.createElement(PropertiesForm,{properties:properties// eslint-disable-next-line @typescript-eslint/no-explicit-any
,required:_required,value:value,setValue:setValue}));}}return null;}function PropertiesForm(props){var{properties,required,value,setValue}=props;// eslint-disable-next-line @typescript-eslint/no-explicit-any
var handleSetValue=(key,v)=>newValue=>{setValue(Object.assign({},v||{},{[key]:newValue}));};return/*#__PURE__*/react.createElement(react.Fragment,null,Object.entries(properties).map(_ref=>{var[key,schema]=_ref;return/*#__PURE__*/react.createElement(SchemaForm,{key:key,schema:schema,required:required&&required.indexOf(key)>-1,value:value===null||value===void 0?void 0:value[key],setValue:handleSetValue(key,value)});}));}function JSONSchemaForm(props){var{schema,value,setValue,className}=props;return/*#__PURE__*/react.createElement(Grid/* default */.ZP,{container:true,spacing:1,className:className},/*#__PURE__*/react.createElement(SchemaForm,{schema:schema,value:value,setValue:setValue}));}

/***/ })

}]);
//# sourceMappingURL=148-e64eccccf5ba787b5caa.js.map