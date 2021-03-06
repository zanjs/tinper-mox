'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _modelBase = require('./model/model-base');

var _modelBase2 = _interopRequireDefault(_modelBase);

var _utils = require('./utils');

var _relation = require('./relation');

var _relation2 = _interopRequireDefault(_relation);

var _create = require('./model/create');

var _create2 = _interopRequireDefault(_create);

var _composeMiddleware = require('./middleware/compose-middleware');

var _composeMiddleware2 = _interopRequireDefault(_composeMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globalMiddleware = new _composeMiddleware2.default(); /**
                                                           * MobxContent:在执行start初始化应用的时候，会:
                                                           * 1、将传递进来的配置项（Model/Middleware/Relation保存处理）；
                                                           * 2、实例化传递进来的Model数据，并将middleware作为参数传进去；
                                                           * 3、执行Relation的相关操作，初始化及Middleware添加hook。
                                                           * */

var Context = function () {
    /**
     * @param {Object} models
     * @param {Object} opts
     *    - parentContext
     *    - middleware
     *    - relation
     */
    function Context() {
        var _this = this;

        var models = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, Context);

        this._middleware = opts.middleware || globalMiddleware;
        this._relation = opts.relation || new _relation2.default();
        this._models = {};

        this.models = models;

        this.setData(models);

        this._addRelationMiddleware();

        // trigger relation init function in async
        setTimeout(function () {
            _this._relation.triggerInit(_this);
            _this._relation.triggerAutorun(_this);
        });
    }

    (0, _createClass3.default)(Context, [{
        key: 'setData',
        value: function setData(models) {
            var _this2 = this;

            this._data = (0, _assign2.default)({}, this._data, (0, _utils.mapValues)(models, function (Model) {
                if ((0, _utils.isObject)(Model)) {
                    Model = (0, _create2.default)(Model);
                }

                // Get a class
                if ((0, _modelBase.isMobxModelClass)(Model)) {
                    return new Model(null, _this2._middleware);
                }

                // Get an instance
                if (Model instanceof _modelBase2.default) {
                    // update model's middleware
                    Model.middleware = _this2._middleware;
                    return Model;
                }
            }));
        }
    }, {
        key: 'addModel',
        value: function addModel(models) {
            this.models = models;

            this.setData(models);
        }
    }, {
        key: '_addRelationMiddleware',
        value: function _addRelationMiddleware() {
            var _this3 = this;

            if (this._relationRemove) {
                return;
            }

            var hook = function hook(arg) {
                var fullname = _this3._findKeyByModel(arg.model) + '.' + arg.action;

                // exec async
                setTimeout(function () {
                    _this3._relation.execInMiddleware((0, _extends3.default)({}, arg, {
                        fullname: fullname,
                        context: _this3
                    }));
                });
                return arg.payload;
            };

            // 在这里设置了relation进去，使得在中间件执行结束后会自动执行这里的hook
            this._relationRemove = this._middleware.use({
                after: hook
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // remove relation middleware
            if (this._relationRemove) {
                this._relationRemove();
                this._relationRemove = null;
            }
        }
    }, {
        key: 'checkMobxModels',
        value: function checkMobxModels(mobxModels) {
            var _this4 = this;

            if (Array.isArray(mobxModels)) {
                mobxModels.forEach(function (name) {
                    if (!_this4._data[name]) {
                        throw new Error('[@observer] Can not find data "' + name + '" in MobxContext.');
                    }
                });
            } else {
                (0, _utils.each)(mobxModels, function (MobxModel, name) {
                    if (_this4._data[name]) {
                        if (!(0, _modelBase.isMobxModelClass)(MobxModel)) {
                            throw new TypeError('[@observer] MobxContext required MobxModel class.');
                        }
                        if (!(_this4._data[name] instanceof MobxModel)) {
                            throw new TypeError('[@observer] ' + name + ' is not instance of ' + MobxModel.name + '.');
                        }
                    } else {
                        throw new Error('[@observer] Can not find data "' + name + '" in MobxContext.');
                    }
                });
            }
        }
    }, {
        key: 'pick',
        value: function pick() {
            var _this5 = this;

            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                keys[_key] = arguments[_key];
            }

            return keys.reduce(function (obj, key) {
                if (!_this5._data[key]) throw new Error('[MobxContext] Can not find data "' + key + '" in MobxContext.');
                obj[key] = _this5._data[key];
                return obj;
            }, {});
        }
    }, {
        key: 'find',
        value: function find(key) {
            if (!this._data[key]) throw new Error('[MobxContext] Can not find data "' + key + '" in MobxContext.');
            return this._data[key];
        }
    }, {
        key: '_findKeyByModel',
        value: function _findKeyByModel(model) {
            var _this6 = this;

            return (0, _keys2.default)(this._data).find(function (key) {
                return _this6._data[key] === model;
            });
        }
    }, {
        key: 'models',
        set: function set(models) {
            var _this7 = this;

            // 校验是否重名
            (0, _keys2.default)(models).some(function (key) {
                if (key in _this7._models) {
                    console.error('[vanex]: You have already existed the same model key: \'' + key + '\'');

                    return true;
                }
            });

            this._models = (0, _assign2.default)(this._models || {}, models);
        }
    }, {
        key: 'relation',
        set: function set(newRelation) {
            this._relation = newRelation;
        },
        get: function get() {
            return this._relation;
        }
    }, {
        key: 'middleware',
        get: function get() {
            return this._middleware;
        }
    }, {
        key: 'data',
        get: function get() {
            return this._data;
        }
    }]);
    return Context;
}();

exports.default = Context;
module.exports = exports['default'];