'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.started = exports.componentIns = exports.context = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _mobxReact = require('mobx-react');

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _relation = require('./relation');

var _relation2 = _interopRequireDefault(_relation);

var _composeMiddleware = require('./middleware/compose-middleware');

var _composeMiddleware2 = _interopRequireDefault(_composeMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerComponent;
var middleware = new _composeMiddleware2.default();

var context = exports.context = undefined;
var componentIns = exports.componentIns = undefined;
var started = exports.started = false;

/**
 * 如果 start 没有配置 container 选项，则返回一个可渲染的组件；
 * 如果传递了container，则执行渲染。
 * [middlewares description]
 * @type {Array}
 */

exports.default = function (_ref) {
    var component = _ref.component,
        models = _ref.models,
        container = _ref.container,
        _ref$middlewares = _ref.middlewares,
        middlewares = _ref$middlewares === undefined ? [] : _ref$middlewares,
        _ref$relation = _ref.relation,
        relation = _ref$relation === undefined ? new _relation2.default() : _ref$relation;

    exports.started = started = true;

    ContainerComponent = component;

    if (!Array.isArray(middlewares)) {
        middlewares = [middlewares];
    }

    middlewares.forEach(function (item) {
        middleware.use(item);
    });

    exports.context = context = new _context2.default(models, {
        middleware: middleware,
        relation: relation
    });

    /**
     * MoxExecComponent 由 Provider 容器组件包裹的可执行组件
     * Params:
     *  componentIns
     *  ContainerComponent
     */

    var MoxExecComponent = function (_Component) {
        (0, _inherits3.default)(MoxExecComponent, _Component);

        function MoxExecComponent(props, context) {
            (0, _classCallCheck3.default)(this, MoxExecComponent);

            var _this = (0, _possibleConstructorReturn3.default)(this, (MoxExecComponent.__proto__ || (0, _getPrototypeOf2.default)(MoxExecComponent)).call(this, props, context));

            exports.componentIns = componentIns = _this;
            return _this;
        }

        (0, _createClass3.default)(MoxExecComponent, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement(
                    _mobxReact.Provider,
                    (0, _extends3.default)({ ref: 'provider' }, context.data),
                    _react2.default.createElement(ContainerComponent, this.props.data)
                );
            }
        }]);
        return MoxExecComponent;
    }(_react.Component);

    var containerEl = container;

    /**
     * 如果传递了容器(选择器)，则执行 React 的 render 进行渲染
     * 否则直接返回一个由 Provider 包裹后的 MoxExecComponent 组件
     */
    if (containerEl) {
        if (typeof container === 'string') {
            containerEl = document.querySelector(container);
        }

        (0, _reactDom.render)(_react2.default.createElement(MoxExecComponent, null), containerEl);
    } else {
        return MoxExecComponent;
    }
};