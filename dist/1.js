(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./components/LazyTippy.tsx":
/*!**********************************!*\
  !*** ./components/LazyTippy.tsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _tippyjs_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tippyjs/react */ "../node_modules/@tippyjs/react/dist/tippy-react.esm.js");
// Will only render the `content` or `render` elements if the tippy is mounted to the DOM.
// Replace <Tippy /> with <LazyTippy /> component and it should work the same.



/* harmony default export */ __webpack_exports__["default"] = (function (props) {
  var _a = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(react__WEBPACK_IMPORTED_MODULE_1___default.a.useState(false), 2),
      mounted = _a[0],
      setMounted = _a[1];

  var lazyPlugin = {
    fn: function fn() {
      return {
        onShow: function onShow() {
          return setMounted(true);
        },
        onHidden: function onHidden() {
          return setMounted(false);
        }
      };
    }
  };

  var computedProps = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, props);

  computedProps.plugins = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spread"])([lazyPlugin], props.plugins || []);

  if (props.render) {
    var render_1 = props.render; // let TypeScript safely derive that render is not undefined

    computedProps.render = function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      return mounted ? render_1.apply(void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spread"])(args)) : '';
    };
  } else {
    computedProps.content = mounted ? props.content : '';
  }

  return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_tippyjs_react__WEBPACK_IMPORTED_MODULE_2__["default"], Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, computedProps));
});

/***/ })

}]);
//# sourceMappingURL=1.js.map