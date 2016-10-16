'use strict';

function createCommonjsModule(fn, module) {
    return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
     * additional grant of patent rights can be found in the PATENTS file in
     * the same directory.
     */

    !function (global) {
        "use strict";

        var hasOwn = Object.prototype.hasOwnProperty;
        var undefined; // More compressible than void 0.
        var $Symbol = typeof Symbol === "function" ? Symbol : {};
        var iteratorSymbol = $Symbol.iterator || "@@iterator";
        var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

        var inModule = typeof module === "object";
        var runtime = global.regeneratorRuntime;
        if (runtime) {
            if (inModule) {
                // If regeneratorRuntime is defined globally and we're in a module,
                // make the exports object identical to regeneratorRuntime.
                module.exports = runtime;
            }
            // Don't bother evaluating the rest of this file if the runtime was
            // already defined globally.
            return;
        }

        // Define the runtime globally (as expected by generated code) as either
        // module.exports (if we're in a module) or a new, empty object.
        runtime = global.regeneratorRuntime = inModule ? module.exports : {};

        function wrap(innerFn, outerFn, self, tryLocsList) {
            // If outerFn provided, then outerFn.prototype instanceof Generator.
            var generator = Object.create((outerFn || Generator).prototype);
            var context = new Context(tryLocsList || []);

            // The ._invoke method unifies the implementations of the .next,
            // .throw, and .return methods.
            generator._invoke = makeInvokeMethod(innerFn, self, context);

            return generator;
        }
        runtime.wrap = wrap;

        // Try/catch helper to minimize deoptimizations. Returns a completion
        // record like context.tryEntries[i].completion. This interface could
        // have been (and was previously) designed to take a closure to be
        // invoked without arguments, but in all the cases we care about we
        // already have an existing method we want to call, so there's no need
        // to create a new function object. We can even get away with assuming
        // the method takes exactly one argument, since that happens to be true
        // in every case, so we don't have to touch the arguments object. The
        // only additional allocation required is the completion record, which
        // has a stable shape and so hopefully should be cheap to allocate.
        function tryCatch(fn, obj, arg) {
            try {
                return { type: "normal", arg: fn.call(obj, arg) };
            } catch (err) {
                return { type: "throw", arg: err };
            }
        }

        var GenStateSuspendedStart = "suspendedStart";
        var GenStateSuspendedYield = "suspendedYield";
        var GenStateExecuting = "executing";
        var GenStateCompleted = "completed";

        // Returning this object from the innerFn has the same effect as
        // breaking out of the dispatch switch statement.
        var ContinueSentinel = {};

        // Dummy constructor functions that we use as the .constructor and
        // .constructor.prototype properties for functions that return Generator
        // objects. For full spec compliance, you may wish to configure your
        // minifier not to mangle the names of these two functions.
        function Generator() {}
        function GeneratorFunction() {}
        function GeneratorFunctionPrototype() {}

        var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
        GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
        GeneratorFunctionPrototype.constructor = GeneratorFunction;
        GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

        // Helper for defining the .next, .throw, and .return methods of the
        // Iterator interface in terms of a single ._invoke method.
        function defineIteratorMethods(prototype) {
            ["next", "throw", "return"].forEach(function (method) {
                prototype[method] = function (arg) {
                    return this._invoke(method, arg);
                };
            });
        }

        runtime.isGeneratorFunction = function (genFun) {
            var ctor = typeof genFun === "function" && genFun.constructor;
            return ctor ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
        };

        runtime.mark = function (genFun) {
            if (Object.setPrototypeOf) {
                Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
            } else {
                genFun.__proto__ = GeneratorFunctionPrototype;
                if (!(toStringTagSymbol in genFun)) {
                    genFun[toStringTagSymbol] = "GeneratorFunction";
                }
            }
            genFun.prototype = Object.create(Gp);
            return genFun;
        };

        // Within the body of any async function, `await x` is transformed to
        // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
        // `value instanceof AwaitArgument` to determine if the yielded value is
        // meant to be awaited. Some may consider the name of this method too
        // cutesy, but they are curmudgeons.
        runtime.awrap = function (arg) {
            return new AwaitArgument(arg);
        };

        function AwaitArgument(arg) {
            this.arg = arg;
        }

        function AsyncIterator(generator) {
            function invoke(method, arg, resolve, reject) {
                var record = tryCatch(generator[method], generator, arg);
                if (record.type === "throw") {
                    reject(record.arg);
                } else {
                    var result = record.arg;
                    var value = result.value;
                    if (value instanceof AwaitArgument) {
                        return Promise.resolve(value.arg).then(function (value) {
                            invoke("next", value, resolve, reject);
                        }, function (err) {
                            invoke("throw", err, resolve, reject);
                        });
                    }

                    return Promise.resolve(value).then(function (unwrapped) {
                        // When a yielded Promise is resolved, its final value becomes
                        // the .value of the Promise<{value,done}> result for the
                        // current iteration. If the Promise is rejected, however, the
                        // result for this iteration will be rejected with the same
                        // reason. Note that rejections of yielded Promises are not
                        // thrown back into the generator function, as is the case
                        // when an awaited Promise is rejected. This difference in
                        // behavior between yield and await is important, because it
                        // allows the consumer to decide what to do with the yielded
                        // rejection (swallow it and continue, manually .throw it back
                        // into the generator, abandon iteration, whatever). With
                        // await, by contrast, there is no opportunity to examine the
                        // rejection reason outside the generator function, so the
                        // only option is to throw it from the await expression, and
                        // let the generator function handle the exception.
                        result.value = unwrapped;
                        resolve(result);
                    }, reject);
                }
            }

            if (typeof process === "object" && process.domain) {
                invoke = process.domain.bind(invoke);
            }

            var previousPromise;

            function enqueue(method, arg) {
                function callInvokeWithMethodAndArg() {
                    return new Promise(function (resolve, reject) {
                        invoke(method, arg, resolve, reject);
                    });
                }

                return previousPromise =
                // If enqueue has been called before, then we want to wait until
                // all previous Promises have been resolved before calling invoke,
                // so that results are always delivered in the correct order. If
                // enqueue has not been called before, then it is important to
                // call invoke immediately, without waiting on a callback to fire,
                // so that the async generator function has the opportunity to do
                // any necessary setup in a predictable way. This predictability
                // is why the Promise constructor synchronously invokes its
                // executor callback, and why async functions synchronously
                // execute code before the first await. Since we implement simple
                // async functions in terms of async generators, it is especially
                // important to get this right, even though it requires care.
                previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
                // Avoid propagating failures to Promises returned by later
                // invocations of the iterator.
                callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
            }

            // Define the unified helper method that is used to implement .next,
            // .throw, and .return (see defineIteratorMethods).
            this._invoke = enqueue;
        }

        defineIteratorMethods(AsyncIterator.prototype);

        // Note that simple async functions are implemented on top of
        // AsyncIterator objects; they just return a Promise for the value of
        // the final result produced by the iterator.
        runtime.async = function (innerFn, outerFn, self, tryLocsList) {
            var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

            return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
            : iter.next().then(function (result) {
                return result.done ? result.value : iter.next();
            });
        };

        function makeInvokeMethod(innerFn, self, context) {
            var state = GenStateSuspendedStart;

            return function invoke(method, arg) {
                if (state === GenStateExecuting) {
                    throw new Error("Generator is already running");
                }

                if (state === GenStateCompleted) {
                    if (method === "throw") {
                        throw arg;
                    }

                    // Be forgiving, per 25.3.3.3.3 of the spec:
                    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
                    return doneResult();
                }

                while (true) {
                    var delegate = context.delegate;
                    if (delegate) {
                        if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
                            // A return or throw (when the delegate iterator has no throw
                            // method) always terminates the yield* loop.
                            context.delegate = null;

                            // If the delegate iterator has a return method, give it a
                            // chance to clean up.
                            var returnMethod = delegate.iterator["return"];
                            if (returnMethod) {
                                var record = tryCatch(returnMethod, delegate.iterator, arg);
                                if (record.type === "throw") {
                                    // If the return method threw an exception, let that
                                    // exception prevail over the original return or throw.
                                    method = "throw";
                                    arg = record.arg;
                                    continue;
                                }
                            }

                            if (method === "return") {
                                // Continue with the outer return, now that the delegate
                                // iterator has been terminated.
                                continue;
                            }
                        }

                        var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

                        if (record.type === "throw") {
                            context.delegate = null;

                            // Like returning generator.throw(uncaught), but without the
                            // overhead of an extra function call.
                            method = "throw";
                            arg = record.arg;
                            continue;
                        }

                        // Delegate generator ran and handled its own exceptions so
                        // regardless of what the method was, we continue as if it is
                        // "next" with an undefined arg.
                        method = "next";
                        arg = undefined;

                        var info = record.arg;
                        if (info.done) {
                            context[delegate.resultName] = info.value;
                            context.next = delegate.nextLoc;
                        } else {
                            state = GenStateSuspendedYield;
                            return info;
                        }

                        context.delegate = null;
                    }

                    if (method === "next") {
                        // Setting context._sent for legacy support of Babel's
                        // function.sent implementation.
                        context.sent = context._sent = arg;
                    } else if (method === "throw") {
                        if (state === GenStateSuspendedStart) {
                            state = GenStateCompleted;
                            throw arg;
                        }

                        if (context.dispatchException(arg)) {
                            // If the dispatched exception was caught by a catch block,
                            // then let that catch block handle the exception normally.
                            method = "next";
                            arg = undefined;
                        }
                    } else if (method === "return") {
                        context.abrupt("return", arg);
                    }

                    state = GenStateExecuting;

                    var record = tryCatch(innerFn, self, context);
                    if (record.type === "normal") {
                        // If an exception is thrown from innerFn, we leave state ===
                        // GenStateExecuting and loop back for another invocation.
                        state = context.done ? GenStateCompleted : GenStateSuspendedYield;

                        var info = {
                            value: record.arg,
                            done: context.done
                        };

                        if (record.arg === ContinueSentinel) {
                            if (context.delegate && method === "next") {
                                // Deliberately forget the last sent value so that we don't
                                // accidentally pass it on to the delegate.
                                arg = undefined;
                            }
                        } else {
                            return info;
                        }
                    } else if (record.type === "throw") {
                        state = GenStateCompleted;
                        // Dispatch the exception by looping back around to the
                        // context.dispatchException(arg) call above.
                        method = "throw";
                        arg = record.arg;
                    }
                }
            };
        }

        // Define Generator.prototype.{next,throw,return} in terms of the
        // unified ._invoke helper method.
        defineIteratorMethods(Gp);

        Gp[iteratorSymbol] = function () {
            return this;
        };

        Gp[toStringTagSymbol] = "Generator";

        Gp.toString = function () {
            return "[object Generator]";
        };

        function pushTryEntry(locs) {
            var entry = { tryLoc: locs[0] };

            if (1 in locs) {
                entry.catchLoc = locs[1];
            }

            if (2 in locs) {
                entry.finallyLoc = locs[2];
                entry.afterLoc = locs[3];
            }

            this.tryEntries.push(entry);
        }

        function resetTryEntry(entry) {
            var record = entry.completion || {};
            record.type = "normal";
            delete record.arg;
            entry.completion = record;
        }

        function Context(tryLocsList) {
            // The root entry object (effectively a try statement without a catch
            // or a finally block) gives us a place to store values thrown from
            // locations where there is no enclosing try statement.
            this.tryEntries = [{ tryLoc: "root" }];
            tryLocsList.forEach(pushTryEntry, this);
            this.reset(true);
        }

        runtime.keys = function (object) {
            var keys = [];
            for (var key in object) {
                keys.push(key);
            }
            keys.reverse();

            // Rather than returning an object with a next method, we keep
            // things simple and return the next function itself.
            return function next() {
                while (keys.length) {
                    var key = keys.pop();
                    if (key in object) {
                        next.value = key;
                        next.done = false;
                        return next;
                    }
                }

                // To avoid creating an additional object, we just hang the .value
                // and .done properties off the next function object itself. This
                // also ensures that the minifier will not anonymize the function.
                next.done = true;
                return next;
            };
        };

        function values(iterable) {
            if (iterable) {
                var iteratorMethod = iterable[iteratorSymbol];
                if (iteratorMethod) {
                    return iteratorMethod.call(iterable);
                }

                if (typeof iterable.next === "function") {
                    return iterable;
                }

                if (!isNaN(iterable.length)) {
                    var i = -1,
                        next = function next() {
                        while (++i < iterable.length) {
                            if (hasOwn.call(iterable, i)) {
                                next.value = iterable[i];
                                next.done = false;
                                return next;
                            }
                        }

                        next.value = undefined;
                        next.done = true;

                        return next;
                    };

                    return next.next = next;
                }
            }

            // Return an iterator with no values.
            return { next: doneResult };
        }
        runtime.values = values;

        function doneResult() {
            return { value: undefined, done: true };
        }

        Context.prototype = {
            constructor: Context,

            reset: function (skipTempReset) {
                this.prev = 0;
                this.next = 0;
                // Resetting context._sent for legacy support of Babel's
                // function.sent implementation.
                this.sent = this._sent = undefined;
                this.done = false;
                this.delegate = null;

                this.tryEntries.forEach(resetTryEntry);

                if (!skipTempReset) {
                    for (var name in this) {
                        // Not sure about the optimal order of these conditions:
                        if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                            this[name] = undefined;
                        }
                    }
                }
            },

            stop: function () {
                this.done = true;

                var rootEntry = this.tryEntries[0];
                var rootRecord = rootEntry.completion;
                if (rootRecord.type === "throw") {
                    throw rootRecord.arg;
                }

                return this.rval;
            },

            dispatchException: function (exception) {
                if (this.done) {
                    throw exception;
                }

                var context = this;
                function handle(loc, caught) {
                    record.type = "throw";
                    record.arg = exception;
                    context.next = loc;
                    return !!caught;
                }

                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var entry = this.tryEntries[i];
                    var record = entry.completion;

                    if (entry.tryLoc === "root") {
                        // Exception thrown outside of any try block that could handle
                        // it, so set the completion value of the entire function to
                        // throw the exception.
                        return handle("end");
                    }

                    if (entry.tryLoc <= this.prev) {
                        var hasCatch = hasOwn.call(entry, "catchLoc");
                        var hasFinally = hasOwn.call(entry, "finallyLoc");

                        if (hasCatch && hasFinally) {
                            if (this.prev < entry.catchLoc) {
                                return handle(entry.catchLoc, true);
                            } else if (this.prev < entry.finallyLoc) {
                                return handle(entry.finallyLoc);
                            }
                        } else if (hasCatch) {
                            if (this.prev < entry.catchLoc) {
                                return handle(entry.catchLoc, true);
                            }
                        } else if (hasFinally) {
                            if (this.prev < entry.finallyLoc) {
                                return handle(entry.finallyLoc);
                            }
                        } else {
                            throw new Error("try statement without catch or finally");
                        }
                    }
                }
            },

            abrupt: function (type, arg) {
                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var entry = this.tryEntries[i];
                    if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                        var finallyEntry = entry;
                        break;
                    }
                }

                if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
                    // Ignore the finally entry if control is not jumping to a
                    // location outside the try/catch block.
                    finallyEntry = null;
                }

                var record = finallyEntry ? finallyEntry.completion : {};
                record.type = type;
                record.arg = arg;

                if (finallyEntry) {
                    this.next = finallyEntry.finallyLoc;
                } else {
                    this.complete(record);
                }

                return ContinueSentinel;
            },

            complete: function (record, afterLoc) {
                if (record.type === "throw") {
                    throw record.arg;
                }

                if (record.type === "break" || record.type === "continue") {
                    this.next = record.arg;
                } else if (record.type === "return") {
                    this.rval = record.arg;
                    this.next = "end";
                } else if (record.type === "normal" && afterLoc) {
                    this.next = afterLoc;
                }
            },

            finish: function (finallyLoc) {
                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var entry = this.tryEntries[i];
                    if (entry.finallyLoc === finallyLoc) {
                        this.complete(entry.completion, entry.afterLoc);
                        resetTryEntry(entry);
                        return ContinueSentinel;
                    }
                }
            },

            "catch": function (tryLoc) {
                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var entry = this.tryEntries[i];
                    if (entry.tryLoc === tryLoc) {
                        var record = entry.completion;
                        if (record.type === "throw") {
                            var thrown = record.arg;
                            resetTryEntry(entry);
                        }
                        return thrown;
                    }
                }

                // The context.catch method must only be called with a location
                // argument that corresponds to a known catch block.
                throw new Error("illegal catch attempt");
            },

            delegateYield: function (iterable, resultName, nextLoc) {
                this.delegate = {
                    iterator: values(iterable),
                    resultName: resultName,
                    nextLoc: nextLoc
                };

                return ContinueSentinel;
            }
        };
    }(
    // Among the various tricks for obtaining a reference to the global
    // object, this seems to be the most reliable technique that does not
    // use indirect eval (which violates Content Security Policy).
    typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : this);
});

var index = createCommonjsModule(function (module, exports) {
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : new P(function (resolve) {
                    resolve(result.value);
                }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments)).next());
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = __awaiter;
    }

    exports.__awaiter = __awaiter;
});

window.__awaiter = index;

function BooleanConverter(val) {
    if (typeof val === "boolean") {
        return val;
    } else if (typeof val === "string") {
        switch (val) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                throw new Error(`Invalid string ${ val } for parsing as boolean`);
        }
    }
    throw new Error(`Parsing failed: ${ val }`);
}

class NodeUtility {
    /**
     * Get index of NodeList converted from index in Element
     * @param  {HTMLElement} targetElement Parent element of search target elements
     * @param  {number}      elementIndex  Index in element
     * @return {number}                    Index in NodeList
     */
    static getNodeListIndexByElementIndex(targetElement, elementIndex) {
        const nodeArray = Array.prototype.slice.call(targetElement.childNodes);
        const elementArray = nodeArray.filter(v => {
            return v.nodeType === 1;
        });
        elementIndex = elementIndex < 0 ? elementArray.length + elementIndex : elementIndex;
        const index = nodeArray.indexOf(elementArray[elementIndex]);
        return index === -1 ? null : index;
    }
    static getAttributes(element) {
        const attributes = {};
        const domAttr = element.attributes;
        for (let i = 0; i < domAttr.length; i++) {
            const attrNode = domAttr.item(i);
            const name = attrNode.name;
            attributes[name] = attrNode.value;
        }
        return attributes;
    }
}

class Constants {
    static get defaultNamespace() {
        return "HTTP://GRIMOIRE.GL/NS/DEFAULT";
    }
}

/**
 * The class to identity with XML namespace feature.
 */
class NSIdentity {
    constructor(ns, name) {
        if (name) {
            this.ns = ns.toUpperCase();
            this.name = name;
        } else {
            this.ns = Constants.defaultNamespace;
            this.name = ns;
        }
        // Ensure all of the characters are uppercase
        this.name = NSIdentity._ensureValidIdentity(this.name, true);
        this.ns = NSIdentity._ensureValidIdentity(this.ns);
        this.fqn = this.name + "|" + this.ns;
    }
    /**
     * Generate an instance from Full qualified name.
     * @param  {string}             fqn [description]
     * @return {NSIdentity}     [description]
     */
    static fromFQN(fqn) {
        const splitted = fqn.split("|");
        if (splitted.length !== 2) {
            throw new Error("Invalid fqn was given");
        }
        return new NSIdentity(splitted[1], splitted[0]);
    }
    /**
     * Make sure given name is valid for using in identity.
     * | is prohibited for using in name or namespace.
     * . is prohibited for using in name.
     * All lowercase alphabet will be transformed into uppercase.
     * @param  {string} name        [A name to verify]
     * @param  {[type]} noDot=false [Ensure not using dot or not]
     * @return {string}             [Valid name]
     */
    static _ensureValidIdentity(name, noDot = false) {
        if (name.indexOf("|") > -1) {
            throw new Error("Namespace and identity cannnot contain | ");
        }
        if (noDot && name.indexOf(".") > -1) {
            throw new Error("identity cannnot contain .");
        }
        if (name == null) {
            throw new Error("Specified name was null or undefined");
        }
        return name;
    }
}

class NSDictionary {
    constructor() {
        this._nameObjectMap = new Map();
        this._fqnObjectMap = new Map();
    }
    set(key, value) {
        let namedChildMap;
        if (this._nameObjectMap.has(key.name)) {
            namedChildMap = this._nameObjectMap.get(key.name);
        } else {
            namedChildMap = new Map();
            this._nameObjectMap.set(key.name, namedChildMap);
        }
        namedChildMap.set(key.fqn, value);
        this._fqnObjectMap.set(key.fqn, value);
    }
    delete(key) {
        if (this._fqnObjectMap.has(key.fqn)) {
            const theMap = this._nameObjectMap.get(key.name);
            if (theMap.size === 1) {
                this._nameObjectMap.delete(key.name);
            } else {
                theMap.delete(key.fqn);
            }
            this._fqnObjectMap.delete(key.fqn);
        }
    }
    get(arg1, name) {
        if (typeof arg1 === "string") {
            if (name) {
                return this.get(new NSIdentity(arg1, name));
            } else {
                const namedMap = this._nameObjectMap.get(arg1);
                if (!namedMap) {
                    return null;
                }
                if (namedMap.size === 1) {
                    const itr = namedMap.values();
                    return itr.next().value;
                } else {
                    throw new Error(`Specified tag name ${ arg1 } is ambigious to identify.`);
                }
            }
        } else {
            if (arg1 instanceof NSIdentity) {
                return this.fromFQN(arg1.fqn);
            } else {
                if (arg1.prefix) {
                    return this.get(new NSIdentity(arg1.namespaceURI, arg1.localName));
                } else {
                    if (arg1.namespaceURI && this._fqnObjectMap.has(arg1.localName + "|" + arg1.namespaceURI)) {
                        return this.get(new NSIdentity(arg1.namespaceURI, arg1.localName));
                    }
                    if (arg1 && arg1.ownerElement && arg1.ownerElement.namespaceURI && this._fqnObjectMap.has(arg1.localName + "|" + arg1.ownerElement.namespaceURI)) {
                        return this.get(new NSIdentity(arg1.ownerElement.namespaceURI, arg1.localName));
                    }
                    return this.get(arg1.localName);
                }
            }
        }
    }
    fromFQN(fqn) {
        return this._fqnObjectMap.get(fqn);
    }
    isAmbigious(name) {
        return this._nameObjectMap.get(name).size > 1;
    }
    has(name) {
        return this._nameObjectMap.has(name);
    }
    pushDictionary(dict) {
        dict._fqnObjectMap.forEach((value, keyFQN) => {
            const id = NSIdentity.fromFQN(keyFQN);
            this.set(id, value);
        });
        return this;
    }
    toArray() {
        const ret = [];
        this._fqnObjectMap.forEach(value => {
            ret.push(value);
        });
        return ret;
    }
    clone() {
        const dict = new NSDictionary();
        return dict.pushDictionary(this);
    }
    forEach(callback) {
        this._fqnObjectMap.forEach((val, key) => {
            callback(val, key);
        });
        return this;
    }
    map(callback) {
        const ret = new NSDictionary();
        this._fqnObjectMap.forEach((val, fqn) => {
            const id = NSIdentity.fromFQN(fqn);
            ret.set(id, callback(val, fqn));
        });
        return ret;
    }
    clear() {
        this._nameObjectMap.clear();
        this._fqnObjectMap.clear();
    }
}

/**
 * Provides static methods to ensure arguments are valid type.
 */
class Ensure {
    /**
     * Ensure specified str being string
     * @param  {string | number}      str [description]
     * @return {string}      [description]
     */
    static ensureString(str) {
        if (typeof str === "string") {
            return str;
        } else if (typeof str === "number") {
            return str.toString();
        } else {
            throw new Error("Specified argument can not convert into string");
        }
    }
    /**
     * Ensure specified number being number
     * @param  {string | number}      str [description]
     * @return {string}      [description]
     */
    static ensureNumber(num) {
        if (typeof num === "string") {
            return parseInt(num, 10);
        } else if (typeof num === "number") {
            return num;
        } else {
            throw new Error("specified argument can not be converted into number");
        }
    }
    static ensureTobeNSIdentity(name) {
        if (!name) {
            return undefined;
        }
        if (typeof name === "string") {
            return new NSIdentity(name);
        } else {
            return name;
        }
    }
    static ensureTobeNSIdentityArray(names) {
        if (!names) {
            return [];
        }
        const newArr = [];
        for (let i = 0; i < names.length; i++) {
            newArr.push(this.ensureTobeNSIdentity(names[i]));
        }
        return newArr;
    }
    static ensureTobeNSDictionary(dict, defaultNamespace) {
        if (!dict) {
            return new NSDictionary();
        }
        if (dict instanceof NSDictionary) {
            return dict;
        } else {
            const newDict = new NSDictionary();
            for (let key in dict) {
                newDict.set(new NSIdentity(defaultNamespace, key), dict[key]);
            }
            return newDict;
        }
    }
    static ensureTobeMessage(message) {
        if (message.startsWith("$")) {
            return message;
        } else {
            return "$" + message;
        }
    }
}

/**
 * Management a single attribute with specified type. Converter will serve a value with object with any type instead of string.
 * When attribute is changed, emit a "change" event. When attribute is requested, emit a "get" event.
 * If responsive flag is not true, event will not be emitted.
 */
class Attribute {
    constructor() {
        this._handlers = [];
    }
    get tree() {
        return this.component.tree;
    }
    get companion() {
        return this.component.companion;
    }
    /**
     * Get a value with specified type.
     * @return {any} value with specified type.
     */
    get Value() {
        try {
            return this.converter.convert(this._value);
        } catch (e) {
            console.error(e); // TODO should be more convenient error handling
        }
    }
    /**
     * Set a value with any type.
     * @param {any} val Value with string or specified type.
     */
    set Value(val) {
        this._value = val;
        this._notifyChange();
    }
    /**
     * Construct a new attribute with name of key and any value with specified type. If constant flag is true, This attribute will be immutable.
     * If converter is not served, string converter will be set as default.
     * @param {string}        key       Key of this attribute.
     * @param {any}           value     Value of this attribute.
     * @param {ConverterBase} converter Converter of this attribute.
     * @param {boolean}       constant  Whether this attribute is immutable or not. False as default.
     */
    static generateAttributeForComponent(name, declaration, component) {
        const attr = new Attribute();
        attr.name = new NSIdentity(component.name.ns, name);
        attr.component = component;
        attr.declaration = declaration;
        const converterName = Ensure.ensureTobeNSIdentity(declaration.converter);
        attr.converter = obtainGomlInterface.converters.get(converterName);
        if (attr.converter === void 0) {
            // When the specified converter was not found
            throw new Error(`Specified converter ${ converterName.name } was not found from registered converters.\n Component: ${ attr.component.name.fqn }\n Attribute: ${ attr.name.name }`);
        }
        attr.converter = {
            convert: attr.converter.convert.bind(attr),
            name: attr.converter.name
        };
        attr.component.attributes.set(attr.name, attr);
        return attr;
    }
    addObserver(handler, callFirst = false) {
        this._handlers.push(handler);
        if (callFirst) {
            handler(this);
        }
    }
    removeObserver(handler) {
        let index = -1;
        for (let i = 0; i < this._handlers.length; i++) {
            if (handler === this._handlers[i]) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            return;
        }
        this._handlers.splice(index, 1);
    }
    /**
     * Bind converted value to specified field.
     * When target object was not specified, field of owner component would be assigned.
     * @param {string} variableName [description]
     * @param {any} targetObject [description]
     */
    boundTo(variableName, targetObject = this.component) {
        this.addObserver(v => {
            targetObject[variableName] = v.Value;
        });
        targetObject[variableName] = this.Value;
    }
    /**
     * Apply default value to attribute from DOM values.
     * @param {string }} domValues [description]
     */
    resolveDefaultValue(domValues) {
        if (this._value !== void 0) {
            return;
        }
        let tagAttrValue = domValues[this.name.name];
        if (tagAttrValue !== void 0) {
            this.Value = tagAttrValue; // Dom指定値で解決
            return;
        }
        const nodeDefaultValue = this.component.node.nodeDeclaration.defaultAttributes.get(this.name);
        if (nodeDefaultValue !== void 0) {
            this.Value = nodeDefaultValue; // Node指定値で解決
            return;
        }
        const attrDefaultValue = this.declaration.defaultValue;
        this.Value = attrDefaultValue;
    }
    _notifyChange() {
        this._handlers.forEach(handler => {
            handler(this);
        });
    }
}

/**
 * Most based object for any Grimoire.js related classes.
 * @type {[type]}
 */
class IDObject {
    constructor() {
        this.id = IDObject.getUniqueRandom(10);
    }
    /**
     * Generate random string
     * @param  {number} length length of random string
     * @return {string}        generated string
     */
    static getUniqueRandom(length) {
        return Math.random().toString(36).slice(-length);
    }
    /**
     * Obtain stringfied object.
     * If this method was not overridden, this method return class name.
     * @return {string} stringfied object
     */
    toString() {
        return this.getTypeName();
    }
    /**
     * Obtain class name
     * @return {string} Class name of the instance.
     */
    getTypeName() {
        const funcNameRegex = /function (.{1,})\(/;
        const result = funcNameRegex.exec(this.constructor.toString());
        return result && result.length > 1 ? result[1] : "";
    }
}

/**
 * Base class for any components
 */
class Component extends IDObject {
    constructor() {
        super(...arguments);
        /**
         * Whether this component was created by nodeDeclaration
         * @type {boolean}
         */
        this.isDefaultComponent = false;
        /**
         * Flag that this component is activated or not.
         * @type {boolean}
         */
        this._enabled = true;
        this._handlers = [];
        this._additionalAttributesNames = [];
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(val) {
        if (this._enabled === val) {
            return;
        }
        this._enabled = val;
        this._handlers.forEach(handler => {
            handler(this);
        });
    }
    /**
     * The dictionary which is shared in entire tree.
     * @return {NSDictionary<any>} [description]
     */
    get companion() {
        return this.node ? this.node.companion : null;
    }
    /**
     * Tree interface for the tree this node is attached.
     * @return {IGomlInterface} [description]
     */
    get tree() {
        return this.node ? this.node.tree : null;
    }
    /**
     * Obtain value of attribute. When the attribute is not existing, this method would return undefined.
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    getValue(name) {
        const attr = this.attributes.get(name);
        if (attr) {
            return attr.Value;
        } else {
            return undefined;
        }
    }
    /**
     * Set value of attribute
     * @param {string} name  [description]
     * @param {any}    value [description]
     */
    setValue(name, value) {
        const attr = this.attributes.get(name); // TODO:check readonly?
        if (attr) {
            attr.Value = value;
        }
    }
    getAttribute(name) {
        return this.attributes.get(name);
    }
    addEnabledObserver(handler) {
        this._handlers.push(handler);
    }
    removeEnabledObserver(handler) {
        let index = -1;
        for (let i = 0; i < this._handlers.length; i++) {
            if (handler === this._handlers[i]) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            return;
        }
        this._handlers.splice(index, 1);
    }
    resolveDefaultAttributes(nodeAttributes) {
        if (this.isDefaultComponent) {
            this.attributes.forEach(attr => attr.resolveDefaultValue(nodeAttributes));
        } else {
            const attrs = NodeUtility.getAttributes(this.element);
            this.attributes.forEach(attr => attr.resolveDefaultValue(attrs));
        }
    }
    /**
     * Add attribute
     * @param {string}                name      [description]
     * @param {IAttributeDeclaration} attribute [description]
     */
    __addAtribute(name, attribute) {
        if (!attribute) {
            throw new Error("can not add attribute null or undefined.");
        }
        const attr = Attribute.generateAttributeForComponent(name, attribute, this);
        if (this.isDefaultComponent) {
            this.node.addAttribute(attr);
        }
        if (this.isDefaultComponent) {
            attr.resolveDefaultValue(NodeUtility.getAttributes(this.node.element));
        } else {
            const attrs = NodeUtility.getAttributes(this.element);
            attr.resolveDefaultValue(attrs);
        }
        this._additionalAttributesNames.push(attr.name);
    }
    __removeAttributes(name) {
        if (name) {
            const index = this._additionalAttributesNames.findIndex(id => id.name === name);
            if (index < 0) {
                throw new Error("can not remove attributes :" + name);
            }
            const attrId = this._additionalAttributesNames[index];
            if (this.isDefaultComponent) {
                this.node.removeAttribute(this.attributes.get(attrId));
            }
            this.attributes.delete(attrId);
            this._additionalAttributesNames.splice(index, 1);
        } else {
            this._additionalAttributesNames.forEach(id => {
                this.__removeAttributes(id.name);
            });
        }
    }
}

class GrimoireComponent extends Component {
    $awake() {
        this.node.resolveAttributesValue();
        this.getAttribute("id").addObserver(attr => {
            this.node.element.id = attr.Value;
        });
        this.getAttribute("class").addObserver(attr => {
            this.node.element.className = attr.Value.join(" ");
        });
        this.getAttribute("enabled").addObserver(attr => {
            if (this.node.isActive) {
                this.node.notifyActivenessUpdate();
            }
        });
    }
}
GrimoireComponent.attributes = {
    id: {
        converter: "String",
        defaultValue: null,
        readonly: false
    },
    class: {
        converter: "StringArray",
        defaultValue: null,
        readonly: false
    },
    enabled: {
        converter: "Boolean",
        defaultValue: true,
        readonly: false
    }
};

function StringArrayConverter(val) {
    if (Array.isArray(val) || !val) {
        return val;
    }
    if (typeof val === "string") {
        return val.split(" ");
    }
    throw new Error("value is not supported by StringArrayConverter.:" + val);
}

function StringConverter(val) {
    if (typeof val === "string") {
        return val;
    } else if (!val) {
        return val;
    } else if (typeof val.toString === "function") {
        return val.toString();
    }
    throw new Error("value is not supported by StringConverter.");
}

class ComponentDeclaration {
    constructor(name, attributes, ctor) {
        this.name = name;
        this.ctor = ctor;
        this.attributes = attributes;
    }
    generateInstance(componentElement) {
        componentElement = componentElement ? componentElement : document.createElementNS(this.name.ns, this.name.name);
        const component = new this.ctor();
        componentElement.setAttribute("x-gr-id", component.id);
        obtainGomlInterface.componentDictionary[component.id] = component;
        component.name = this.name;
        component.element = componentElement;
        component.attributes = new NSDictionary();
        for (let key in this.attributes) {
            Attribute.generateAttributeForComponent(key, this.attributes[key], component);
        }
        return component;
    }
}

class NSSet {
    constructor() {
        this._contentArray = [];
    }
    static fromArray(array) {
        const nSet = new NSSet();
        nSet.pushArray(array);
        return nSet;
    }
    push(item) {
        const index = this._contentArray.findIndex(id => id.fqn === item.fqn);
        if (index === -1) {
            this._contentArray.push(item);
        }
        return this;
    }
    pushArray(item) {
        item.forEach(v => {
            this.push(v);
        });
        return this;
    }
    values() {
        return this._contentArray.values();
    }
    toArray() {
        const ret = [];
        for (let item of this._contentArray) {
            ret.push(item);
        }
        return ret;
    }
    clone() {
        const newSet = new NSSet();
        for (let i of this._contentArray) {
            newSet.push(i);
        }
        return newSet;
    }
    merge(other) {
        for (let elem of other._contentArray) {
            this.push(elem);
        }
        return this;
    }
}

class NodeDeclaration {
    constructor(name, _defaultComponents, _defaultAttributes, superNode, _treeConstraints) {
        this.name = name;
        this._defaultComponents = _defaultComponents;
        this._defaultAttributes = _defaultAttributes;
        this.superNode = superNode;
        this._treeConstraints = _treeConstraints;
        if (!this.superNode && this.name.name.toUpperCase() !== "GRIMOIRENODEBASE") {
            this.superNode = new NSIdentity("GrimoireNodeBase");
        }
    }
    get defaultComponents() {
        if (!this._defaultComponentsActual) {
            this._resolveInherites();
        }
        return this._defaultComponentsActual;
    }
    get defaultAttributes() {
        if (!this._defaultAttributesActual) {
            this._resolveInherites();
        }
        return this._defaultAttributesActual;
    }
    get treeConstraints() {
        return this._treeConstraints;
    }
    addDefaultComponent(componentName) {
        const componentId = Ensure.ensureTobeNSIdentity(componentName);
        this._defaultComponents.push(componentId);
        if (this._defaultComponentsActual) {
            this._defaultComponentsActual.push(componentId);
        }
    }
    _resolveInherites() {
        if (!this.superNode) {
            this._defaultComponentsActual = this._defaultComponents;
            this._defaultAttributesActual = this._defaultAttributes;
            return;
        }
        const superNode = obtainGomlInterface.nodeDeclarations.get(this.superNode);
        const inheritedDefaultComponents = superNode.defaultComponents;
        const inheritedDefaultAttribute = superNode.defaultAttributes;
        this._defaultComponentsActual = inheritedDefaultComponents.clone().merge(this._defaultComponents);
        this._defaultAttributesActual = inheritedDefaultAttribute.clone().pushDictionary(this._defaultAttributes);
    }
}

/**
 * Provides safe xml read feature.
 */
class XMLReader {
    static parseXML(doc, rootElementName) {
        const parsed = XMLReader._parser.parseFromString(doc, "text/xml");
        if (rootElementName) {
            if (parsed.documentElement.tagName.toUpperCase() !== rootElementName.toUpperCase()) {
                throw new Error("Specified document is invalid.");
            } // TODO should throw more detail error
        }
        return [parsed.documentElement]; // TODO: implenent!
    }
    static getElements(elem, name) {
        const result = [];
        const elems = elem.getElementsByTagName(name);
        for (let i = 0; i < elems.length; i++) {
            result.push(elems.item(i));
        }
        return result;
    }
    static getSingleElement(elem, name, mandatory) {
        const result = XMLReader.getElements(elem, name);
        if (result.length === 1) {
            return result[0];
        } else if (result.length === 0) {
            if (mandatory) {
                throw new Error(`The mandatory element ${ name } was required, but not found`);
            } else {
                return null;
            }
        } else {
            throw new Error(`The element ${ name } requires to exist in single. But there is ${ result.length } count of elements`);
        }
    }
    static getAttribute(elem, name, mandatory) {
        const result = elem.attributes.getNamedItem(name);
        if (result) {
            return result.value;
        } else if (mandatory) {
            throw new Error(`The mandatory attribute ${ name } was required, but it was not found`);
        } else {
            return null;
        }
    }
    static getAttributeFloat(elem, name, mandatory) {
        const resultStr = XMLReader.getAttribute(elem, name, mandatory);
        return parseFloat(resultStr);
    }
    static getAttributeInt(elem, name, mandatory) {
        const resultStr = XMLReader.getAttribute(elem, name, mandatory);
        return parseInt(resultStr, 10);
    }
    static getChildElements(elem) {
        const children = elem.childNodes;
        const result = [];
        for (let i = 0; i < children.length; i++) {
            if (children.item(i) instanceof Element) {
                result.push(children.item(i));
            }
        }
        return result;
    }
    static getAttributes(elem, ns) {
        const result = {};
        const attrs = elem.attributes;
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs.item(i);
            if (!ns || attr.namespaceURI === ns) {
                result[attr.localName] = attr.value;
            }
        }
        return result;
    }
}
XMLReader._parser = new DOMParser();

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
    EventEmitter.init.call(this);
}
EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
    this.domain = null;
    if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active && !(this instanceof domain.Domain)) {
            this.domain = domain.active;
        }
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
};

function $getMaxListeners(that) {
    if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
    if (isFn) handler.call(self);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) listeners[i].call(self);
    }
}
function emitOne(handler, isFn, self, arg1) {
    if (isFn) handler.call(self, arg1);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) listeners[i].call(self, arg1);
    }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn) handler.call(self, arg1, arg2);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2);
    }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn) handler.call(self, arg1, arg2, arg3);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2, arg3);
    }
}

function emitMany(handler, isFn, self, args) {
    if (isFn) handler.apply(self, args);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) listeners[i].apply(self, args);
    }
}

EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var needDomainExit = false;
    var doError = type === 'error';

    events = this._events;
    if (events) doError = doError && events.error == null;else if (!doError) return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
        er = arguments[1];
        if (domain) {
            if (!er) er = new Error('Uncaught, unspecified "error" event');
            er.domainEmitter = this;
            er.domain = domain;
            er.domainThrown = false;
            domain.emit('error', er);
        } else if (er instanceof Error) {
            throw er; // Unhandled 'error' event
        } else {
            // At least give some kind of context to the user
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
            err.context = er;
            throw err;
        }
        return false;
    }

    handler = events[type];

    if (!handler) return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
        // fast cases
        case 1:
            emitNone(handler, isFn, this);
            break;
        case 2:
            emitOne(handler, isFn, this, arguments[1]);
            break;
        case 3:
            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
            break;
        case 4:
            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
            break;
        // slower
        default:
            args = new Array(len - 1);
            for (i = 1; i < len; i++) args[i - 1] = arguments[i];
            emitMany(handler, isFn, this, args);
    }

    if (needDomainExit) domain.exit();

    return true;
};

function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
    } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
            target.emit('newListener', type, listener.listener ? listener.listener : listener);

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events;
        }
        existing = events[type];
    }

    if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
    } else {
        if (typeof existing === 'function') {
            // Adding the second element, need to change to array.
            existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else {
            // If we've already got an array, just append.
            if (prepend) {
                existing.unshift(listener);
            } else {
                existing.push(listener);
            }
        }

        // Check for listener leak
        if (!existing.warned) {
            m = $getMaxListeners(target);
            if (m && m > 0 && existing.length > m) {
                existing.warned = true;
                var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
                w.name = 'MaxListenersExceededWarning';
                w.emitter = target;
                w.type = type;
                w.count = existing.length;
                emitWarning(w);
            }
        }
    }

    return target;
}
function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
};

function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
        target.removeListener(type, g);
        if (!fired) {
            fired = true;
            listener.apply(target, arguments);
        }
    }
    g.listener = listener;
    return g;
}

EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    var list, events, position, i, originalListener;

    if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

    events = this._events;
    if (!events) return this;

    list = events[type];
    if (!list) return this;

    if (list === listener || list.listener && list.listener === listener) {
        if (--this._eventsCount === 0) this._events = new EventHandlers();else {
            delete events[type];
            if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
        }
    } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
            }
        }

        if (position < 0) return this;

        if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
            } else {
                delete events[type];
            }
        } else {
            spliceOne(list, position);
        }

        if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    var listeners, events;

    events = this._events;
    if (!events) return this;

    // not listening for removeListener, no need to emit
    if (!events.removeListener) {
        if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
        } else if (events[type]) {
            if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
        }
        return this;
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
    }

    listeners = events[type];

    if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
    } else if (listeners) {
        // LIFO order
        do {
            this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
    }

    return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events) ret = [];else {
        evlistener = events[type];
        if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
    }

    return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
    } else {
        return listenerCount.call(emitter, type);
    }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
    var events = this._events;

    if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
            return 1;
        } else if (evlistener) {
            return evlistener.length;
        }
    }

    return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) list[i] = list[k];
    list.pop();
}

function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--) copy[i] = arr[i];
    return copy;
}

function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
    }
    return ret;
}

/**
 * EventEmitterをmixinしたIDObject
 */
class EEObject extends IDObject {
    constructor() {
        super();
    }
    emitException(eventName, error) {
        error.handled = false;
        const listeners = this.listeners(eventName);
        for (let i = 0; i < listeners.length; i++) {
            listeners[listeners.length - i - 1](error);
            if (error.handled) {
                return;
            }
        }
        if (eventName !== "error") {
            this.emitException("error", error);
        } else {
            throw error;
        }
    }
}
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
applyMixins(EEObject, [EventEmitter]);

class GomlNode extends EEObject {
    /**
     * 新しいインスタンスの作成
     * @param  {NodeDeclaration} recipe  作成するノードのDeclaration
     * @param  {Element}         element 対応するDomElement
     * @return {[type]}                  [description]
     */
    constructor(recipe, element) {
        super();
        this.children = [];
        this._parent = null;
        this._root = null;
        this._mounted = false;
        this._messageBuffer = [];
        this._tree = null;
        this._companion = new NSDictionary();
        this._deleted = false;
        this._attrBuffer = {};
        this._defaultValueResolved = false;
        if (!recipe) {
            throw new Error("recipe must not be null");
        }
        this.nodeDeclaration = recipe;
        this.element = element ? element : document.createElementNS(recipe.name.ns, recipe.name.name); // TODO Could be undefined or null?
        this.componentsElement = document.createElement("COMPONENTS");
        this._root = this;
        this._tree = GomlInterfaceGenerator([this]);
        this._components = [];
        this.attributes = new NSDictionary();
        this.element.setAttribute("x-gr-id", this.id);
        const defaultComponentNames = recipe.defaultComponents;
        // instanciate default components
        defaultComponentNames.toArray().map(id => {
            this.addComponent(id, true);
        });
        // register to GrimoireInterface.
        obtainGomlInterface.nodeDictionary[this.id] = this;
    }
    /**
     * Get actual goml node from element of xml tree.
     * @param  {Element}  elem [description]
     * @return {GomlNode}      [description]
     */
    static fromElement(elem) {
        return obtainGomlInterface.nodeDictionary[elem.getAttribute("x-gr-id")];
    }
    get name() {
        return this.nodeDeclaration.name;
    }
    /**
     * このノードの属するツリーのGomlInterface。unmountedならnull。
     * @return {IGomlInterface} [description]
     */
    get tree() {
        return this._tree;
    }
    get deleted() {
        return this._deleted;
    }
    get isActive() {
        if (this._parent) {
            return this._parent.isActive && this.enabled;
        } else {
            return this.enabled;
        }
    }
    get enabled() {
        return this.attr("enabled");
    }
    set enabled(value) {
        this.attr("enabled", value);
    }
    /**
     * ツリーで共有されるオブジェクト。マウントされていない状態ではnull。
     * @return {NSDictionary<any>} [description]
     */
    get companion() {
        return this._companion;
    }
    get nodeName() {
        return this.nodeDeclaration.name;
    }
    get parent() {
        return this._parent;
    }
    get hasChildren() {
        return this.children.length > 0;
    }
    /**
     * Get mounted status.
     * @return {boolean} Whether this node is mounted or not.
     */
    get mounted() {
        return this._mounted;
    }
    getChildrenByClass(className) {
        const nodes = this.element.getElementsByClassName(className);
        return new Array(nodes.length).map((v, i) => GomlNode.fromElement(nodes.item(i)));
    }
    getChildrenByNodeName(nodeName) {
        const nodes = this.element.getElementsByTagName(nodeName);
        return new Array(nodes.length).map((v, i) => GomlNode.fromElement(nodes.item(i)));
    }
    /**
     * ノードを削除する。使わなくなったら呼ぶ。子要素も再帰的に削除する。
     */
    delete() {
        this.children.forEach(c => {
            c.delete();
        });
        obtainGomlInterface.nodeDictionary[this.id] = null;
        if (this._parent) {
            this._parent.detachChild(this);
        } else {
            this.setMounted(false);
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
        this._deleted = true;
    }
    sendMessage(message, args) {
        if (!this.enabled || !this.mounted) {
            return false;
        }
        this._components.forEach(component => {
            this._sendMessageToComponent(component, message, false, false, args);
        });
        return true;
    }
    broadcastMessage(arg1, arg2, arg3) {
        if (!this.enabled || !this.mounted) {
            return;
        }
        if (typeof arg1 === "number") {
            const range = arg1;
            const message = arg2;
            const args = arg3;
            this.sendMessage(message, args);
            if (range > 0) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].broadcastMessage(range - 1, message, args);
                }
            }
        } else {
            const message = arg1;
            const args = arg2;
            this.sendMessage(message, args);
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].broadcastMessage(message, args);
            }
        }
    }
    /**
     * 指定したノード名と属性で生成されたノードの新しいインスタンスを、このノードの子要素として追加
     * @param {string |   NSIdentity} nodeName      [description]
     * @param {any    }} attributes   [description]
     */
    addNode(nodeName, attributes) {
        if (typeof nodeName === "string") {
            this.addNode(new NSIdentity(nodeName), attributes);
        } else {
            const nodeDec = obtainGomlInterface.nodeDeclarations.get(nodeName);
            const node = new GomlNode(nodeDec, null);
            if (attributes) {
                for (let key in attributes) {
                    const id = key.indexOf("|") !== -1 ? NSIdentity.fromFQN(key) : new NSIdentity(key);
                    node.attr(id, attributes[key]);
                }
            }
            this.addChild(node);
        }
    }
    /**
     * Add child.
     * @param {GomlNode} child            追加する子ノード
     * @param {number}   index            追加位置。なければ末尾に追加
     * @param {[type]}   elementSync=true trueのときはElementのツリーを同期させる。（Elementからパースするときはfalseにする）
     */
    addChild(child, index, elementSync = true) {
        if (child._deleted) {
            throw new Error("deleted node never use.");
        }
        if (index != null && typeof index !== "number") {
            throw new Error("insert index should be number or null or undefined.");
        }
        child._parent = this;
        const insertIndex = index == null ? this.children.length : index;
        this.children.splice(insertIndex, 0, child);
        const checkChildConstraints = child.checkTreeConstraints();
        const checkAncestorConstraint = this._callRecursively(n => n.checkTreeConstraints(), n => n._parent ? [n._parent] : []).reduce((list, current) => list.concat(current));
        const errors = checkChildConstraints.concat(checkAncestorConstraint).filter(m => m);
        if (errors.length !== 0) {
            const message = errors.reduce((m, current) => m + "\n" + current);
            throw new Error("tree constraint is not satisfied.\n" + message);
        }
        // handling html
        if (elementSync) {
            let referenceElement = this.element[NodeUtility.getNodeListIndexByElementIndex(this.element, insertIndex)];
            this.element.insertBefore(child.element, referenceElement);
        }
        child._tree = this.tree;
        child._companion = this.companion;
        // mounting
        if (this.mounted) {
            child.setMounted(true);
        }
    }
    callRecursively(func) {
        return this._callRecursively(func, n => n.children);
    }
    /**
     * デタッチしてdeleteする。
     * @param {GomlNode} child Target node to be inserted.
     */
    removeChild(child) {
        const node = this.detachChild(child);
        if (node) {
            node.delete();
        }
    }
    /**
     * 指定したノードが子要素なら子要素から外す。
     * @param  {GomlNode} child [description]
     * @return {GomlNode}       [description]
     */
    detachChild(target) {
        // search child.
        const index = this.children.indexOf(target);
        if (index === -1) {
            return null;
        }
        target.setMounted(false);
        target._parent = null;
        this.children.splice(index, 1);
        // html sync
        this.element.removeChild(target.element);
        // check ancestor constraint.
        const errors = this._callRecursively(n => n.checkTreeConstraints(), n => n._parent ? [n._parent] : []).reduce((list, current) => list.concat(current)).filter(m => m);
        if (errors.length !== 0) {
            const message = errors.reduce((m, current) => m + "\n" + current);
            throw new Error("tree constraint is not satisfied.\n" + message);
        }
        return target;
    }
    /**
     * detach myself
     */
    detach() {
        if (this.parent) {
            this.parent.detachChild(this);
        } else {
            throw new Error("root Node cannot be detached.");
        }
    }
    attr(attrName, value) {
        attrName = Ensure.ensureTobeNSIdentity(attrName);
        const attr = this.attributes.get(attrName);
        if (value !== void 0) {
            // setValue.
            if (!attr) {
                console.warn(`attribute "${ attrName.name }" is not found.`);
                this._attrBuffer[attrName.fqn] = value;
            } else {
                attr.Value = value;
            }
        } else {
            // getValue.
            if (!attr) {
                const attrBuf = this._attrBuffer[attrName.fqn];
                if (attrBuf !== void 0) {
                    console.log("get attrBuf!");
                    return attrBuf;
                }
                console.warn(`attribute "${ attrName.name }" is not found.`);
                return;
            } else {
                return attr.Value;
            }
        }
    }
    /**
     *  Add new attribute. In most of case, users no need to call this method.
     *  Use __addAttribute in Component should be used instead.
     */
    addAttribute(attr) {
        this.attributes.set(attr.name, attr);
        // check buffer value.
        const attrBuf = this._attrBuffer[attr.name.fqn];
        if (attrBuf !== void 0) {
            attr.Value = attrBuf;
            delete this._attrBuffer[attr.name.fqn];
        }
    }
    /**
     * Update mounted status and emit events
     * @param {boolean} mounted Mounted status.
     */
    setMounted(mounted) {
        if (this._mounted === mounted) {
            return;
        }
        if (mounted) {
            this._mounted = mounted;
            this._clearMessageBuffer("unmount");
            this._sendMessage("awake", true, false);
            this._sendMessage("mount", false, true);
            this.children.forEach(child => {
                child.setMounted(mounted);
            });
        } else {
            this._clearMessageBuffer("mount");
            this.children.forEach(child => {
                child.setMounted(mounted);
            });
            this._sendMessage("unmount", false, true);
            this._sendMessage("dispose", true, false);
            this._tree = null;
            this._companion = null;
            this._mounted = mounted;
        }
    }
    /**
     * Get index of this node from parent.
     * @return {number} number of index.
     */
    index() {
        return this._parent.children.indexOf(this);
    }
    removeAttribute(attr) {
        this.attributes.delete(attr.name);
    }
    /**
     * このノードにコンポーネントをアタッチする。
     * @param {Component} component [description]
     */
    addComponent(component, isDefaultComponent = false) {
        const declaration = obtainGomlInterface.componentDeclarations.get(component);
        const instance = declaration.generateInstance();
        this._addComponentDirectly(instance, isDefaultComponent);
        return instance;
    }
    /**
     * Internal use!
     * Should not operate by users or plugin developpers
     * @param {Component} component          [description]
     * @param {boolean}   isDefaultComponent [description]
     */
    _addComponentDirectly(component, isDefaultComponent) {
        if (isDefaultComponent) {
            component.isDefaultComponent = true;
        }
        const insertIndex = this._components.length;
        let referenceElement = this.componentsElement[NodeUtility.getNodeListIndexByElementIndex(this.componentsElement, insertIndex)];
        this.componentsElement.insertBefore(component.element, referenceElement);
        this._components.push(component);
        component.node = this;
        component.addEnabledObserver(c => {
            if (c.enabled) {
                // TODO ??
                this._sendBufferdMessageToComponent(c, "mount", false, true);
                this._sendBufferdMessageToComponent(c, "unmount", false, true);
            }
        });
        if (isDefaultComponent) {
            // attributes should be exposed on node
            component.attributes.forEach(p => this.addAttribute(p));
            if (this._defaultValueResolved) {
                component.attributes.forEach(p => p.resolveDefaultValue(NodeUtility.getAttributes(this.element)));
            }
        }
        if (this._mounted) {
            this._sendMessageToComponent(component, "awake", true, false);
            this._sendMessageToComponent(component, "mount", false, true);
        }
    }
    getComponents() {
        return this._components;
    }
    getComponent(name) {
        if (typeof name === "string") {
            for (let i = 0; i < this._components.length; i++) {
                if (this._components[i].name.name === name) {
                    return this._components[i];
                }
            }
        } else {
            for (let i = 0; i < this._components.length; i++) {
                if (this._components[i].name.fqn === name.fqn) {
                    return this._components[i];
                }
            }
        }
        return null;
    }
    /**
     * すべてのコンポーネントの属性をエレメントかデフォルト値で初期化
     */
    resolveAttributesValue() {
        this._defaultValueResolved = true;
        this._components.forEach(component => {
            component.resolveDefaultAttributes(NodeUtility.getAttributes(this.element));
        });
    }
    /**
     * このノードのtreeConstrainが満たされるか調べる
     * @return {string[]} [description]
     */
    checkTreeConstraints() {
        const constraints = this.nodeDeclaration.treeConstraints;
        if (!constraints) {
            return [];
        }
        const errorMesasges = constraints.map(constraint => {
            return constraint(this);
        }).filter(message => message !== null);
        if (errorMesasges.length === 0) {
            return null;
        }
        return errorMesasges;
    }
    /**
     * バッファしていたmount,unmountが送信されるかもしれない.アクティブなら
     */
    notifyActivenessUpdate() {
        if (this.isActive) {
            this._sendBufferdMessage(this.mounted ? "mount" : "unmount", false);
            this.children.forEach(child => {
                child.notifyActivenessUpdate();
            });
        }
    }
    /**
     * コンポーネントにメッセージを送る。送信したらバッファからは削除される.
     * @param  {Component} targetComponent 対象コンポーネント
     * @param  {string}    message         メッセージ
     * @param  {boolean}   forced          trueでコンポーネントのenableを無視して送信
     * @param  {boolean}   toBuffer        trueで送信失敗したらバッファに追加
     * @param  {any}       args            [description]
     * @return {boolean}                   送信したか
     */
    _sendMessageToComponent(targetComponent, message, forced, toBuffer, args) {
        message = Ensure.ensureTobeMessage(message);
        const bufferdIndex = this._messageBuffer.findIndex(obj => obj.message === message && obj.target === targetComponent);
        if (!forced && (!targetComponent.enabled || !this.isActive)) {
            if (toBuffer && bufferdIndex < 0) {
                this._messageBuffer.push({ message: Ensure.ensureTobeMessage(message), target: targetComponent });
            }
            return false;
        }
        message = Ensure.ensureTobeMessage(message);
        let method = targetComponent[message];
        if (typeof method === "function") {
            method.bind(targetComponent)(args);
        }
        if (bufferdIndex >= 0) {
            this._messageBuffer.splice(bufferdIndex, 1);
        }
        return true;
    }
    /**
     * バッファからメッセージを送信。成功したらバッファから削除
     * @param  {Component} target  [description]
     * @param  {string}    message [description]
     * @param  {boolean}   forced  [description]
     * @param  {any}       args    [description]
     * @return {boolean}           成功したか
     */
    _sendBufferdMessageToComponent(target, message, forced, sendToRemove, args) {
        if (!forced && (!target.enabled || !this.isActive)) {
            return false;
        }
        message = Ensure.ensureTobeMessage(message);
        const bufferdIndex = this._messageBuffer.findIndex(obj => obj.message === message && obj.target === target);
        if (bufferdIndex >= 0) {
            let method = target[message];
            if (typeof method === "function") {
                method.bind(target)(args);
            }
            if (sendToRemove) {
                this._messageBuffer.splice(bufferdIndex, 1);
            }
            return true;
        }
        return false;
    }
    _sendMessage(message, forced, toBuffer, args) {
        this._components.forEach(component => {
            this._sendMessageToComponent(component, message, forced, toBuffer, args);
        });
    }
    /**
     * バッファのメッセージを送信可能なら送信してバッファから削除
     */
    _sendBufferdMessage(message, forced, args) {
        const next = [];
        message = Ensure.ensureTobeMessage(message);
        this._messageBuffer.forEach(obj => {
            if (obj.message !== message || !this._sendBufferdMessageToComponent(obj.target, message, forced, false, args)) {
                next.push(obj);
            }
        });
        this._messageBuffer = next;
    }
    _clearMessageBuffer(message) {
        message = Ensure.ensureTobeMessage(message);
        this._messageBuffer = this._messageBuffer.filter(obj => obj.message !== message);
    }
    _callRecursively(func, nextGenerator) {
        const val = func(this);
        const nexts = nextGenerator(this);
        const nextVals = nexts.map(c => c.callRecursively(func));
        const list = nextVals.reduce((clist, current) => clist.concat(current), []);
        list.unshift(val);
        return list;
    }
}

/**
 * Parser of Goml to Node utilities.
 * This class do not store any nodes and goml properties.
 */
class GomlParser {
    /**
     * Domをパースする
     * @param  {Element}           source    [description]
     * @param  {GomlNode}          parent    あればこのノードにaddChildされる
     * @return {GomlNode}                    ルートノード
     */
    static parse(source, parent, scriptTag) {
        const newNode = GomlParser._createNode(source);
        if (!newNode) {
            // when specified node could not be found
            console.warn(`"${ source.tagName }" was not parsed.`);
            return null;
        }
        // Parse children recursively
        const children = source.childNodes;
        const childNodeElements = []; // for parse after .Components has resolved.
        if (children && children.length !== 0) {
            const removeTarget = [];
            for (let i = 0; i < children.length; i++) {
                const child = children.item(i);
                if (!GomlParser._isElement(child)) {
                    removeTarget.push(child);
                    continue;
                }
                if (this._isComponentsTag(child)) {
                    // parse as components
                    GomlParser._parseComponents(newNode, child);
                    removeTarget.push(child);
                } else {
                    // parse as child node.
                    childNodeElements.push(child);
                }
            }
            // remove unused elements
            for (let i = 0; i < removeTarget.length; i++) {
                source.removeChild(removeTarget[i]);
            }
        }
        // generate tree
        if (parent) {
            parent.addChild(newNode, null, false);
        }
        childNodeElements.forEach(child => {
            GomlParser.parse(child, newNode, null);
        });
        return newNode;
    }
    /**
     * GomlNodeのインスタンス化。GrimoireInterfaceへの登録
     * @param  {HTMLElement}      elem         [description]
     * @param  {GomlConfigurator} configurator [description]
     * @return {GomlTreeNodeBase}              [description]
     */
    static _createNode(elem) {
        const tagName = elem.localName;
        const recipe = obtainGomlInterface.nodeDeclarations.get(elem);
        if (!recipe) {
            throw new Error(`Tag "${ tagName }" is not found.`);
        }
        return new GomlNode(recipe, elem);
    }
    /**
     * .COMPONENTSのパース。
     * @param {GomlNode} node          アタッチされるコンポーネント
     * @param {Element}  componentsTag .COMPONENTSタグ
     */
    static _parseComponents(node, componentsTag) {
        let componentNodes = componentsTag.childNodes;
        if (!componentNodes) {
            return;
        }
        for (let i = 0; i < componentNodes.length; i++) {
            const componentNode = componentNodes.item(i);
            if (!GomlParser._isElement(componentNode)) {
                continue; // Skip if the node was not element
            }
            const componentDecl = obtainGomlInterface.componentDeclarations.get(componentNode);
            if (!componentDecl) {
                throw new Error(`Component ${ componentNode.tagName } is not found.`);
            }
            const component = componentDecl.generateInstance(componentNode);
            node._addComponentDirectly(component, false);
        }
    }
    static _isElement(node) {
        return node.nodeType === Node.ELEMENT_NODE;
    }
    static _isComponentsTag(element) {
        const regexToFindComponent = /\.COMPONENTS$/mi; // TODO might needs to fix
        return regexToFindComponent.test(element.nodeName);
    }
}

class ComponentInterface {
    constructor(components) {
        this.components = components;
    }
    get(i1, i2, i3) {
        const c = this.components;
        if (i1 === void 0) {
            if (c.length === 0 || c[0].length === 0 || c[0][0].length === 0) {
                return null;
            } else if (c.length === 1 && c[0].length === 1 || c[0][0].length === 1) {
                return c[0][0][0];
            }
            throw new Error("There are too many candidate");
        } else if (i2 === void 0) {
            if (c.length === 0 || c[0].length === 0 || c[0][0].length <= i1) {
                return null;
            } else if (c.length === 1 && c[0].length === 1) {
                return c[0][0][i1];
            }
            throw new Error("There are too many candidate");
        } else if (i3 === void 0) {
            if (c.length === 0 || c[0].length <= i2 || c[0][0].length <= i1) {
                return null;
            } else if (c.length === 1) {
                return c[0][i2][i1];
            }
            throw new Error("There are too many candidate");
        } else {
            if (c.length <= i3 || c[0].length <= i2 || c[0][0].length <= i1) {
                return null;
            }
            return c[i3][i2][i1];
        }
    }
    forEach(f) {
        this.components.forEach((tree, ti) => {
            tree.forEach((nodes, ni) => {
                nodes.forEach((comp, ci) => {
                    f(comp, ci, ni, ti);
                });
            });
        });
        return this;
    }
    attr(attrName, value) {
        if (value === void 0) {
            // return Attribute.
            return this.components[0][0][0].getValue(attrName).Value;
        } else {
            // set value.
            this.forEach(component => {
                component.setValue(attrName, value);
            });
        }
    }
    on() {
        // TODO implement
        return;
    }
    off() {
        // TODO implement
        return;
    }
}

/**
 * 複数のノードを対象とした操作を提供するインタフェース
 */
class NodeInterface {
    constructor(nodes) {
        this.nodes = nodes;
    }
    queryFunc(query) {
        return new ComponentInterface(this.queryComponents(query));
    }
    queryComponents(query) {
        return this.nodes.map(nodes => {
            return nodes.map(node => {
                const componentElements = node.componentsElement.querySelectorAll(query);
                const components = [];
                for (let i = 0; i < componentElements.length; i++) {
                    const elem = componentElements[i];
                    const component = obtainGomlInterface.componentDictionary[elem.getAttribute("x-gr-id")];
                    if (component) {
                        components.push(component);
                    }
                }
                return components;
            });
        });
    }
    get(i1, i2) {
        const c = this.nodes;
        if (i1 === void 0) {
            if (c.length === 0 || c[0].length === 0) {
                return null;
            } else if (c.length === 1 && c[0].length === 1) {
                return c[0][0];
            }
            throw new Error("There are too many candidate");
        } else if (i2 === void 0) {
            if (c.length === 0 || c[0].length <= i1) {
                return null;
            } else if (c.length === 1 && c[0].length > i1) {
                return c[0][i1];
            }
            throw new Error("There are too many candidate");
        } else {
            if (c.length <= i1 || c[i1].length <= i2) {
                return null;
            } else {
                return c[i1][i2];
            }
        }
    }
    attr(attrName, value) {
        if (value === void 0) {
            // return Attribute.
            return this.nodes[0][0].attributes.get(attrName).Value;
        } else {
            // set value.
            this.forEach(node => {
                const attr = node.attributes.get(attrName);
                if (attr.declaration.readonly) {
                    throw new Error(`The attribute ${ attr.name.fqn } is readonly`);
                }
                if (attr) {
                    attr.Value = value;
                }
            });
        }
    }
    /**
     * 対象ノードにイベントリスナを追加します。
     * @param {string}   eventName [description]
     * @param {Function} listener  [description]
     */
    on(eventName, listener) {
        this.forEach(node => {
            node.on(eventName, listener);
        });
        return this;
    }
    /**
     * 対象ノードに指定したイベントリスナが登録されていれば削除します
     * @param {string}   eventName [description]
     * @param {Function} listener  [description]
     */
    off(eventName, listener) {
        this.forEach(node => {
            node.removeListener(eventName, listener);
        });
        return this;
    }
    /**
     * このノードインタフェースが対象とするノードそれぞれに、
     * タグで指定したノードを子要素として追加します。
     * @param {string} tag [description]
     */
    append(tag) {
        this.forEach(node => {
            const elems = XMLReader.parseXML(tag);
            elems.forEach(elem => GomlParser.parse(elem, node, null));
        });
        return this;
    }
    /**
     * このノードインタフェースが対象とするノードの子に、
     * 指定されたノードが存在すれば削除します。
     * @param {GomlNode} child [description]
     */
    remove(child) {
        this.forEach(node => {
            node.removeChild(child);
        });
        return this;
    }
    /**
     * このノードインタフェースが対象とするノードに対して反復処理を行います
     * @param  {GomlNode} callback [description]
     * @return {[type]}            [description]
     */
    forEach(callback) {
        this.nodes.forEach(array => {
            array.forEach(node => {
                callback(node);
            });
        });
        return this;
    }
    /**
     * このノードインタフェースが対象とするノードを有効、または無効にします。
     * @param {boolean} enable [description]
     */
    setEnable(enable) {
        this.forEach(node => {
            node.enabled = !!enable;
        });
        return this;
    }
    /**
     * このノードインタフェースにアタッチされたコンポーネントをセレクタで検索します。
     * @pram  {string}      query [description]
     * @return {Component[]}       [description]
     */
    find(query) {
        const allComponents = [];
        this.queryComponents(query).forEach(gomlComps => {
            gomlComps.forEach(nodeComps => {
                nodeComps.forEach(comp => {
                    allComponents.push(comp);
                });
            });
        });
        return allComponents;
    }
    /**
     * このノードインタフェースが対象とするノードのそれぞれの子ノードを対象とする、
     * 新しいノードインタフェースを取得します。
     * @return {NodeInterface} [description]
     */
    children() {
        const children = this.nodes.map(nodes => {
            return nodes.map(node => {
                return node.children;
            }).reduce((pre, cur) => {
                return pre.concat(cur);
            });
        });
        return new NodeInterface(children);
    }
    /**
     * 対象ノードにコンポーネントをアタッチします。
     * @param {Component} component [description]
     */
    addCompnent(componentId) {
        this.forEach(node => {
            node.addComponent(componentId, false);
        });
        return this;
    }
    /**
     * 最初の対象ノードを取得する
     * @return {GomlNode} [description]
     */
    first() {
        if (this.count() === 0) {
            return null;
        }
        return this.nodes[0][0];
    }
    /**
     * 対象となる唯一のノードを取得する。
     * 対象が存在しない、あるいは複数存在するときは例外を投げる。
     * @return {GomlNode} [description]
     */
    single() {
        if (this.count() !== 1) {
            throw new Error("this nodeInterface is not single.");
        }
        return this.first();
    }
    /**
     * 対象となるノードの個数を取得する
     * @return {number} [description]
     */
    count() {
        if (this.nodes.length === 0) {
            return 0;
        }
        const counts = this.nodes.map(nodes => nodes.length);
        return counts.reduce((total, current) => total + current, 0);
    }
}

/**
 * Provides interfaces to treat whole goml tree for each.
 */
class GomlInterface {
    constructor(rootNodes) {
        this.rootNodes = rootNodes;
    }
    getNodeById(id) {
        return new Array(this.rootNodes.length).map((v, i) => GomlNode.fromElement(this.rootNodes[i].element.ownerDocument.getElementById(id)));
    }
    queryFunc(query) {
        const context = new NodeInterface(this.queryNodes(query));
        const queryFunc = context.queryFunc.bind(context);
        Object.setPrototypeOf(queryFunc, context);
        return queryFunc;
    }
    queryNodes(query) {
        return this.rootNodes.map(root => {
            const nodelist = root.element.ownerDocument.querySelectorAll(query);
            const nodes = [];
            for (let i = 0; i < nodelist.length; i++) {
                const node = obtainGomlInterface.nodeDictionary[nodelist.item(i).getAttribute("x-gr-id")];
                if (node) {
                    nodes.push(node);
                }
            }
            return nodes;
        });
    }
}

var GomlInterfaceGenerator = function (rootNodes) {
    const gomlContext = new GomlInterface(rootNodes);
    const queryFunc = gomlContext.queryFunc.bind(gomlContext);
    Object.setPrototypeOf(queryFunc, gomlContext);
    return queryFunc;
};

class GrimoireInterfaceImpl {
    constructor() {
        this.nodeDeclarations = new NSDictionary();
        this.converters = new NSDictionary();
        this.componentDeclarations = new NSDictionary();
        this.rootNodes = {};
        this.loadTasks = [];
        this.nodeDictionary = {};
        this.componentDictionary = {};
        this.companion = new NSDictionary();
    }
    /**
     * Generate namespace helper function
     * @param  {string} ns namespace URI to be used
     * @return {[type]}    the namespaced identity
     */
    ns(ns) {
        return name => new NSIdentity(ns, name);
    }
    initialize() {
        this.registerConverter("String", StringConverter);
        this.registerConverter("StringArray", StringArrayConverter);
        this.registerConverter("Boolean", BooleanConverter);
        this.registerComponent("GrimoireComponent", GrimoireComponent);
        this.registerNode("GrimoireNodeBase", ["GrimoireComponent"]);
    }
    /**
     * Register plugins
     * @param  {(}      loadTask [description]
     * @return {[type]}          [description]
     */
    register(loadTask) {
        this.loadTasks.push(loadTask);
    }
    resolvePlugins() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.loadTasks.length; i++) {
                yield this.loadTasks[i]();
            }
        });
    }
    /**
     * register custom component
     * @param  {string                |   NSIdentity} name          [description]
     * @param  {IAttributeDeclaration }} attributes           [description]
     * @param  {Object                |   (new                 (}           obj           [description]
     * @return {[type]}                       [description]
     */
    registerComponent(name, obj) {
        name = Ensure.ensureTobeNSIdentity(name);
        const attrs = obj["attributes"];
        obj = this._ensureTobeComponentConstructor(obj);
        this.componentDeclarations.set(name, new ComponentDeclaration(name, attrs, obj));
    }
    registerNode(name, requiredComponents, defaultValues, superNode) {
        name = Ensure.ensureTobeNSIdentity(name);
        requiredComponents = Ensure.ensureTobeNSIdentityArray(requiredComponents);
        defaultValues = Ensure.ensureTobeNSDictionary(defaultValues, name.ns);
        superNode = Ensure.ensureTobeNSIdentity(superNode);
        this.nodeDeclarations.set(name, new NodeDeclaration(name, NSSet.fromArray(requiredComponents), defaultValues, superNode));
    }
    registerConverter(name, converter) {
        name = Ensure.ensureTobeNSIdentity(name);
        this.converters.set(name, { name: name, convert: converter });
    }
    addRootNode(tag, rootNode) {
        if (!rootNode) {
            throw new Error("can not register null to rootNodes.");
        }
        this.rootNodes[rootNode.id] = rootNode;
        rootNode.companion.set(this.ns(Constants.defaultNamespace)("scriptElement"), tag);
        // check tree constraint.
        const errorMessages = rootNode.callRecursively(n => n.checkTreeConstraints()).reduce((list, current) => list.concat(current)).filter(error => error);
        if (errorMessages.length !== 0) {
            const message = errorMessages.reduce((m, current) => m + "\n" + current);
            throw new Error("tree constraint is not satisfied.\n" + message);
        }
        // awake and mount tree.
        rootNode.setMounted(true);
        rootNode.broadcastMessage("treeInitialized", {
            ownerScriptTag: tag,
            id: rootNode.id
        });
        tag.setAttribute("x-rootNodeId", rootNode.id);
        return rootNode.id;
    }
    getRootNode(scriptTag) {
        const id = scriptTag.getAttribute("x-rootNodeId");
        return this.rootNodes[id];
    }
    queryRootNodes(query) {
        const scriptTags = document.querySelectorAll(query);
        const nodes = [];
        for (let i = 0; i < scriptTags.length; i++) {
            const node = this.getRootNode(scriptTags.item(i));
            if (node) {
                nodes.push(node);
            }
        }
        return nodes;
    }
    /**
     * This method is not for users.
     * Just for unit testing.
     *
     * Clear all configuration that GrimoireInterface contain.
     */
    clear() {
        this.nodeDeclarations.clear();
        this.componentDeclarations.clear();
        this.converters.clear();
        for (let key in this.rootNodes) {
            delete this.rootNodes[key];
        }
        this.loadTasks.splice(0, this.loadTasks.length);
        this.initialize();
    }
    /**
     * Ensure the given object or constructor to be an constructor inherits Component;
     * @param  {Object | (new ()=> Component} obj [The variable need to be ensured.]
     * @return {[type]}      [The constructor inherits Component]
     */
    _ensureTobeComponentConstructor(obj) {
        if (typeof obj === "function") {
            if (!(obj.prototype instanceof Component) && obj !== Component) {
                throw new Error("Component constructor must extends Component class.");
            }
        } else if (typeof obj === "object") {
            const newCtor = function () {
                Component.call(this);
            };
            const properties = {};
            for (let key in obj) {
                if (key === "attributes") {
                    continue;
                }
                properties[key] = { value: obj[key] };
            }
            newCtor.prototype = Object.create(Component.prototype, properties);
            Object.defineProperty(newCtor, "attributes", {
                value: obj["attributes"]
            });
            obj = newCtor;
        } else if (!obj) {
            obj = Component;
        }
        return obj;
    }
}
const context = new GrimoireInterfaceImpl();
const obtainGomlInterface = function (query) {
    return GomlInterfaceGenerator(context.queryRootNodes(query));
};
// const bindedFunction = obtainGomlInterface.bind(context);
Object.setPrototypeOf(obtainGomlInterface, context);

class XMLHttpRequestAsync {
    static send(xhr, data) {
        return new Promise((resolve, reject) => {
            xhr.onload = e => {
                resolve(e);
            };
            xhr.onerror = e => {
                reject(e);
            };
            xhr.send(data);
        });
    }
}

/**
 * Provides the features to fetch Goml source.
 */
class GomlLoader {
    /**
     * Obtain the Goml source from specified tag.
     * @param  {HTMLScriptElement} scriptTag [the script tag to load]
     * @return {Promise<void>}               [the promise to wait for loading]
     */
    static loadFromScriptTag(scriptTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const srcAttr = scriptTag.getAttribute("src");
            let source;
            if (srcAttr) {
                // ignore text element
                const req = new XMLHttpRequest();
                req.open("GET", srcAttr);
                yield XMLHttpRequestAsync.send(req);
                source = req.responseText;
            } else {
                source = scriptTag.text;
            }
            const doc = XMLReader.parseXML(source, "GOML");
            const rootNode = GomlParser.parse(doc[0], null, scriptTag);
            obtainGomlInterface.addRootNode(scriptTag, rootNode);
        });
    }
    /**
     * Load from the script tags which will be found with specified query.
     * @param  {string}          query [the query to find script tag]
     * @return {Promise<void[]>}       [the promise to wait for all goml loading]
     */
    static loadFromQuery(query) {
        const tags = document.querySelectorAll(query);
        const pArray = [];
        for (let i = 0; i < tags.length; i++) {
            pArray[i] = GomlLoader.loadFromScriptTag(tags.item(i));
        }
        return Promise.all(pArray);
    }
    /**
     * Load all Goml sources contained in HTML.
     * @return {Promise<void>} [the promise to wait for all goml loading]
     */
    static loadForPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield GomlLoader.loadFromQuery('script[type="text/goml"]');
        });
    }
}

/**
 * Provides procedures for initializing.
 */
class GrimoireInitializer {
    /**
     * Start initializing
     * @return {Promise<void>} The promise which will be resolved when all of the Goml script was loaded.
     */
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                GrimoireInitializer._copyGLConstants();
                obtainGomlInterface.initialize();
                yield GrimoireInitializer._waitForDOMLoading();
                yield obtainGomlInterface.resolvePlugins();
                yield GomlLoader.loadForPage();
            } catch (e) {
                console.error(e);
            }
        });
    }
    /**
     * Ensure WebGLRenderingContext.[CONSTANTS] is exisiting.
     * Some of the browsers contains them in prototype.
     */
    static _copyGLConstants() {
        if (WebGLRenderingContext.ONE) {
            // Assume the CONSTANTS are already in WebGLRenderingContext
            // Chrome,Firefox,IE,Edge...
            return;
        }
        // Otherwise like ""Safari""
        for (let propName in WebGLRenderingContext.prototype) {
            if (/^[A-Z]/.test(propName)) {
                const property = WebGLRenderingContext.prototype[propName];
                WebGLRenderingContext[propName] = property;
            }
        }
    }
    /**
     * Obtain the promise object which will be resolved when DOMContentLoaded event was rised.
     * @return {Promise<void>} the promise
     */
    static _waitForDOMLoading() {
        return new Promise(resolve => {
            window.addEventListener("DOMContentLoaded", () => {
                resolve();
            });
        });
    }
}
/**
 * Just start the process.
 */
GrimoireInitializer.initialize();
window["gr"] = obtainGomlInterface;

class VectorBase {
    constructor() {
        this._magnitudeSquaredCache = -1;
        this._magnitudeCache = -1;
    }
    get magnitude() {
        if (this._magnitudeCache < 0) {
            this._magnitudeCache = Math.sqrt(this.sqrMagnitude);
        }
        return this._magnitudeCache;
    }
    get ElementCount() {
        return 0;
    }
    get sqrMagnitude() {
        if (this._magnitudeSquaredCache < 0) {
            let sum = 0;
            let r = this.rawElements;
            for (let i = 0; i < this.ElementCount; i++) {
                sum += r[i] * r[i];
            }
            this._magnitudeSquaredCache = sum;
        }
        return this._magnitudeSquaredCache;
    }
    static __elementEquals(v1, v2) {
        if (v1.ElementCount !== v2.ElementCount) {
            return false;
        }
        for (let i = 0; i < v1.ElementCount; i++) {
            if (v1.rawElements[i] !== v2.rawElements[i]) {
                return false;
            }
        }
        return true;
    }
    static __nearlyElementEquals(v1, v2) {
        if (v1.ElementCount !== v2.ElementCount) {
            return false;
        }
        let error = 0.01;
        for (let i = 0; i < v1.ElementCount; i++) {
            if (Math.abs(v1.rawElements[i] - v2.rawElements[i]) > error) {
                return false;
            }
        }
        return true;
    }
    static __fromGenerationFunction(v1, v2, gen) {
        let f = new Float32Array(v1.ElementCount);
        for (let i = 0; i < f.length; i++) {
            f[i] = gen(i, v1, v2);
        }
        return f;
    }
    static __parse(str) {
        const checkRegex = /(-?)([\d,E\+\-\.]+)?(n)?\(([-\d,E\+\.\s]+)\)/g;
        const matches = checkRegex.exec(str);
        if (matches) {
            if (!matches[4]) {
                throw new Error(`The specified string '${ str }' is not containing braced vector.`);
            }
            return {
                needNormalize: matches[3] === "n",
                needNegate: matches[1] === "-",
                coefficient: parseFloat(matches[2]),
                elements: VectorBase._parseRawVector(matches[4])
            };
        } else {
            // Assume this is simplified format.
            return {
                needNormalize: false,
                needNegate: false,
                elements: VectorBase._parseRawVector(str),
                coefficient: undefined
            };
        }
    }
    static _parseRawVector(str) {
        const splitted = str.split(",");
        const result = new Array(splitted.length);
        for (let i = 0; i < splitted.length; i++) {
            result[i] = parseFloat(splitted[i]);
            if (isNaN(result[i])) {
                throw new Error(`Unexpected vector string ${ str }`);
            }
        }
        return result;
    }
}

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix$2 = {};

// Configuration Constants
glMatrix$2.EPSILON = 0.000001;
glMatrix$2.ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
glMatrix$2.RANDOM = Math.random;
glMatrix$2.ENABLE_SIMD = false;

// Capability detection
const global$1 = new Function('return this')();
glMatrix$2.SIMD_AVAILABLE = glMatrix$2.ARRAY_TYPE === global$1.Float32Array && 'SIMD' in global$1;
glMatrix$2.USE_SIMD = glMatrix$2.ENABLE_SIMD && glMatrix$2.SIMD_AVAILABLE;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix$2.setMatrixArrayType = function (type) {
    glMatrix$2.ARRAY_TYPE = type;
};

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} a Angle in Degrees
*/
glMatrix$2.toRadian = function (a) {
    return a * degree;
};

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less 
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 * 
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
glMatrix$2.equals = function (a, b) {
    return Math.abs(a - b) <= glMatrix$2.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
};

var common = glMatrix$2;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$3 = common;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$4 = common;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$5 = common;

/**
 * @class 3x3 Matrix
 * @name mat3
 */
var mat3$1 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3$1.create = function () {
    var out = new glMatrix$5.ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3$1.fromMat4 = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3$1.clone = function (a) {
    var out = new glMatrix$5.ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3$1.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */
mat3$1.fromValues = function (m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    var out = new glMatrix$5.ARRAY_TYPE(9);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */
mat3$1.set = function (out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3$1.identity = function (out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3$1.transpose = function (out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }

    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3$1.invert = function (out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,


    // Calculate the determinant
    det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3$1.adjoint = function (out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    out[0] = a11 * a22 - a12 * a21;
    out[1] = a02 * a21 - a01 * a22;
    out[2] = a01 * a12 - a02 * a11;
    out[3] = a12 * a20 - a10 * a22;
    out[4] = a00 * a22 - a02 * a20;
    out[5] = a02 * a10 - a00 * a12;
    out[6] = a10 * a21 - a11 * a20;
    out[7] = a01 * a20 - a00 * a21;
    out[8] = a00 * a11 - a01 * a10;
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3$1.determinant = function (a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3$1.multiply = function (out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        b00 = b[0],
        b01 = b[1],
        b02 = b[2],
        b10 = b[3],
        b11 = b[4],
        b12 = b[5],
        b20 = b[6],
        b21 = b[7],
        b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3$1.mul = mat3$1.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3$1.translate = function (out, a, v) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        x = v[0],
        y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3$1.rotate = function (out, a, rad) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3$1.scale = function (out, a, v) {
    var x = v[0],
        y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */
mat3$1.fromTranslation = function (out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = v[0];
    out[7] = v[1];
    out[8] = 1;
    return out;
};

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3$1.fromRotation = function (out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c;
    out[1] = s;
    out[2] = 0;

    out[3] = -s;
    out[4] = c;
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */
mat3$1.fromScaling = function (out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;

    out[3] = 0;
    out[4] = v[1];
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3$1.fromMat2d = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3$1.fromQuat = function (out, q) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3$1.normalFromMat4 = function (out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,


    // Calculate the determinant
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3$1.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3$1.frob = function (a) {
    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
};

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3$1.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3$1.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    return out;
};

/**
 * Alias for {@link mat3.subtract}
 * @function
 */
mat3$1.sub = mat3$1.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
mat3$1.multiplyScalar = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    return out;
};

/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */
mat3$1.multiplyScalarAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    out[3] = a[3] + b[3] * scale;
    out[4] = a[4] + b[4] * scale;
    out[5] = a[5] + b[5] * scale;
    out[6] = a[6] + b[6] * scale;
    out[7] = a[7] + b[7] * scale;
    out[8] = a[8] + b[8] * scale;
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3$1.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3$1.equals = function (a, b) {
    var a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        a4 = a[4],
        a5 = a[5],
        a6 = a[6],
        a7 = a[7],
        a8 = a[8];
    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3],
        b4 = b[4],
        b5 = b[5],
        b6 = a[6],
        b7 = b[7],
        b8 = b[8];
    return Math.abs(a0 - b0) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix$5.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
};

var mat3_1 = mat3$1;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$6 = common;

/**
 * @class 4x4 Matrix
 * @name mat4
 */
var mat4$1 = {
    scalar: {},
    SIMD: {}
};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4$1.create = function () {
    var out = new glMatrix$6.ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4$1.clone = function (a) {
    var out = new glMatrix$6.ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
mat4$1.fromValues = function (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    var out = new glMatrix$6.ARRAY_TYPE(16);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
};

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */
mat4$1.set = function (out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4$1.identity = function (out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.scalar.transpose = function (out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3],
            a12 = a[6],
            a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }

    return out;
};

/**
 * Transpose the values of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.SIMD.transpose = function (out, a) {
    var a0, a1, a2, a3, tmp01, tmp23, out0, out1, out2, out3;

    a0 = SIMD.Float32x4.load(a, 0);
    a1 = SIMD.Float32x4.load(a, 4);
    a2 = SIMD.Float32x4.load(a, 8);
    a3 = SIMD.Float32x4.load(a, 12);

    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
    out0 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
    out1 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
    SIMD.Float32x4.store(out, 0, out0);
    SIMD.Float32x4.store(out, 4, out1);

    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
    out2 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
    out3 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
    SIMD.Float32x4.store(out, 8, out2);
    SIMD.Float32x4.store(out, 12, out3);

    return out;
};

/**
 * Transpse a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.transpose = glMatrix$6.USE_SIMD ? mat4$1.SIMD.transpose : mat4$1.scalar.transpose;

/**
 * Inverts a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.scalar.invert = function (out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,


    // Calculate the determinant
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Inverts a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.SIMD.invert = function (out, a) {
    var row0,
        row1,
        row2,
        row3,
        tmp1,
        minor0,
        minor1,
        minor2,
        minor3,
        det,
        a0 = SIMD.Float32x4.load(a, 0),
        a1 = SIMD.Float32x4.load(a, 4),
        a2 = SIMD.Float32x4.load(a, 8),
        a3 = SIMD.Float32x4.load(a, 12);

    // Compute matrix adjugate
    tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
    row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
    row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
    row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
    tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
    row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
    row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
    row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

    tmp1 = SIMD.Float32x4.mul(row2, row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor0 = SIMD.Float32x4.mul(row1, tmp1);
    minor1 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
    minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
    minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(row1, row2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
    minor3 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
    minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
    minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
    minor2 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
    minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
    minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(row0, row1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
    minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
    minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

    tmp1 = SIMD.Float32x4.mul(row0, row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
    minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
    minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

    tmp1 = SIMD.Float32x4.mul(row0, row2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
    minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
    minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

    // Compute matrix determinant
    det = SIMD.Float32x4.mul(row0, minor0);
    det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
    det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
    tmp1 = SIMD.Float32x4.reciprocalApproximation(det);
    det = SIMD.Float32x4.sub(SIMD.Float32x4.add(tmp1, tmp1), SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
    det = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
    if (!det) {
        return null;
    }

    // Compute matrix inverse
    SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(det, minor0));
    SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(det, minor1));
    SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(det, minor2));
    SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
    return out;
};

/**
 * Inverts a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.invert = glMatrix$6.USE_SIMD ? mat4$1.SIMD.invert : mat4$1.scalar.invert;

/**
 * Calculates the adjugate of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.scalar.adjoint = function (out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
    out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
    out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
    out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
    out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
    out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
    return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.SIMD.adjoint = function (out, a) {
    var a0, a1, a2, a3;
    var row0, row1, row2, row3;
    var tmp1;
    var minor0, minor1, minor2, minor3;

    a0 = SIMD.Float32x4.load(a, 0);
    a1 = SIMD.Float32x4.load(a, 4);
    a2 = SIMD.Float32x4.load(a, 8);
    a3 = SIMD.Float32x4.load(a, 12);

    // Transpose the source matrix.  Sort of.  Not a true transpose operation
    tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
    row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
    row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
    row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);

    tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
    row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
    row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
    row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

    tmp1 = SIMD.Float32x4.mul(row2, row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor0 = SIMD.Float32x4.mul(row1, tmp1);
    minor1 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
    minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
    minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(row1, row2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
    minor3 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
    minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
    minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
    minor2 = SIMD.Float32x4.mul(row0, tmp1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
    minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
    minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

    tmp1 = SIMD.Float32x4.mul(row0, row1);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
    minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
    minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

    tmp1 = SIMD.Float32x4.mul(row0, row3);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
    minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
    minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

    tmp1 = SIMD.Float32x4.mul(row0, row2);
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
    minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
    minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
    tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
    minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
    minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

    SIMD.Float32x4.store(out, 0, minor0);
    SIMD.Float32x4.store(out, 4, minor1);
    SIMD.Float32x4.store(out, 8, minor2);
    SIMD.Float32x4.store(out, 12, minor3);
    return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4$1.adjoint = glMatrix$6.USE_SIMD ? mat4$1.SIMD.adjoint : mat4$1.scalar.adjoint;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4$1.determinant = function (a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's explicitly using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand, must be a Float32Array
 * @param {mat4} b the second operand, must be a Float32Array
 * @returns {mat4} out
 */
mat4$1.SIMD.multiply = function (out, a, b) {
    var a0 = SIMD.Float32x4.load(a, 0);
    var a1 = SIMD.Float32x4.load(a, 4);
    var a2 = SIMD.Float32x4.load(a, 8);
    var a3 = SIMD.Float32x4.load(a, 12);

    var b0 = SIMD.Float32x4.load(b, 0);
    var out0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 0, out0);

    var b1 = SIMD.Float32x4.load(b, 4);
    var out1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 4, out1);

    var b2 = SIMD.Float32x4.load(b, 8);
    var out2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 8, out2);

    var b3 = SIMD.Float32x4.load(b, 12);
    var out3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 12, out3);

    return out;
};

/**
 * Multiplies two mat4's explicitly not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4$1.scalar.multiply = function (out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    // Cache only the current line of the second matrix
    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
};

/**
 * Multiplies two mat4's using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4$1.multiply = glMatrix$6.USE_SIMD ? mat4$1.SIMD.multiply : mat4$1.scalar.multiply;

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4$1.mul = mat4$1.multiply;

/**
 * Translate a mat4 by the given vector not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4$1.scalar.translate = function (out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2],
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
        a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
        a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

        out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
        out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
        out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Translates a mat4 by the given vector using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4$1.SIMD.translate = function (out, a, v) {
    var a0 = SIMD.Float32x4.load(a, 0),
        a1 = SIMD.Float32x4.load(a, 4),
        a2 = SIMD.Float32x4.load(a, 8),
        a3 = SIMD.Float32x4.load(a, 12),
        vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

    if (a !== out) {
        out[0] = a[0];out[1] = a[1];out[2] = a[2];out[3] = a[3];
        out[4] = a[4];out[5] = a[5];out[6] = a[6];out[7] = a[7];
        out[8] = a[8];out[9] = a[9];out[10] = a[10];out[11] = a[11];
    }

    a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
    a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
    a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));

    var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
    SIMD.Float32x4.store(out, 12, t0);

    return out;
};

/**
 * Translates a mat4 by the given vector using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4$1.translate = glMatrix$6.USE_SIMD ? mat4$1.SIMD.translate : mat4$1.scalar.translate;

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4$1.scalar.scale = function (out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4$1.SIMD.scale = function (out, a, v) {
    var a0, a1, a2;
    var vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

    a0 = SIMD.Float32x4.load(a, 0);
    SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0)));

    a1 = SIMD.Float32x4.load(a, 4);
    SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1)));

    a2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2)));

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 */
mat4$1.scale = glMatrix$6.USE_SIMD ? mat4$1.SIMD.scale : mat4$1.scalar.scale;

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4$1.rotate = function (out, a, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s,
        c,
        t,
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23,
        b00,
        b01,
        b02,
        b10,
        b11,
        b12,
        b20,
        b21,
        b22;

    if (Math.abs(len) < glMatrix$6.EPSILON) {
        return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
    a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
    a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;b01 = y * x * t + z * s;b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.scalar.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.SIMD.rotateX = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_1 = SIMD.Float32x4.load(a, 4);
    var a_2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(out, 4, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_2, s)));
    SIMD.Float32x4.store(out, 8, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_2, c), SIMD.Float32x4.mul(a_1, s)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD if availabe and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.rotateX = glMatrix$6.USE_SIMD ? mat4$1.SIMD.rotateX : mat4$1.scalar.rotateX;

/**
 * Rotates a matrix by the given angle around the Y axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.scalar.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.SIMD.rotateY = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_0 = SIMD.Float32x4.load(a, 0);
    var a_2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(out, 0, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_2, s)));
    SIMD.Float32x4.store(out, 8, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, s), SIMD.Float32x4.mul(a_2, c)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.rotateY = glMatrix$6.USE_SIMD ? mat4$1.SIMD.rotateY : mat4$1.scalar.rotateY;

/**
 * Rotates a matrix by the given angle around the Z axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.scalar.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.SIMD.rotateZ = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_0 = SIMD.Float32x4.load(a, 0);
    var a_1 = SIMD.Float32x4.load(a, 4);
    SIMD.Float32x4.store(out, 0, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_1, s)));
    SIMD.Float32x4.store(out, 4, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_0, s)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.rotateZ = glMatrix$6.USE_SIMD ? mat4$1.SIMD.rotateZ : mat4$1.scalar.rotateZ;

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4$1.fromTranslation = function (out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
mat4$1.fromScaling = function (out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4$1.fromRotation = function (out, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s,
        c,
        t;

    if (Math.abs(len) < glMatrix$6.EPSILON) {
        return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    // Perform rotation-specific matrix multiplication
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.fromXRotation = function (out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = c;
    out[6] = s;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.fromYRotation = function (out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0] = c;
    out[1] = 0;
    out[2] = -s;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4$1.fromZRotation = function (out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0] = c;
    out[1] = s;
    out[2] = 0;
    out[3] = 0;
    out[4] = -s;
    out[5] = c;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4$1.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
};

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
mat4$1.getTranslation = function (out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];

    return out;
};

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
mat4$1.getRotation = function (out, mat) {
    // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    var trace = mat[0] + mat[5] + mat[10];
    var S = 0;

    if (trace > 0) {
        S = Math.sqrt(trace + 1.0) * 2;
        out[3] = 0.25 * S;
        out[0] = (mat[6] - mat[9]) / S;
        out[1] = (mat[8] - mat[2]) / S;
        out[2] = (mat[1] - mat[4]) / S;
    } else if (mat[0] > mat[5] & mat[0] > mat[10]) {
        S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
        out[3] = (mat[6] - mat[9]) / S;
        out[0] = 0.25 * S;
        out[1] = (mat[1] + mat[4]) / S;
        out[2] = (mat[8] + mat[2]) / S;
    } else if (mat[5] > mat[10]) {
        S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
        out[3] = (mat[8] - mat[2]) / S;
        out[0] = (mat[1] + mat[4]) / S;
        out[1] = 0.25 * S;
        out[2] = (mat[6] + mat[9]) / S;
    } else {
        S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
        out[3] = (mat[1] - mat[4]) / S;
        out[0] = (mat[8] + mat[2]) / S;
        out[1] = (mat[6] + mat[9]) / S;
        out[2] = 0.25 * S;
    }

    return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
mat4$1.fromRotationTranslationScale = function (out, q, v, s) {
    // Quaternion math
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
mat4$1.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
    // Quaternion math
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2],
        ox = o[0],
        oy = o[1],
        oz = o[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
    out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
    out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
    out[15] = 1;

    return out;
};

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
mat4$1.fromQuat = function (out, q) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4$1.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = near * 2 * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = near * 2 * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * 2 * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4$1.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4$1.perspectiveFromFieldOfView = function (out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = far * near / (near - far);
    out[15] = 0.0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4$1.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4$1.lookAt = function (out, eye, center, up) {
    var x0,
        x1,
        x2,
        y0,
        y1,
        y2,
        z0,
        z1,
        z2,
        len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < glMatrix$6.EPSILON && Math.abs(eyey - centery) < glMatrix$6.EPSILON && Math.abs(eyez - centerz) < glMatrix$6.EPSILON) {
        return mat4$1.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4$1.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4$1.frob = function (a) {
    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
};

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4$1.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4$1.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
};

/**
 * Alias for {@link mat4.subtract}
 * @function
 */
mat4$1.sub = mat4$1.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
mat4$1.multiplyScalar = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
};

/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */
mat4$1.multiplyScalarAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    out[3] = a[3] + b[3] * scale;
    out[4] = a[4] + b[4] * scale;
    out[5] = a[5] + b[5] * scale;
    out[6] = a[6] + b[6] * scale;
    out[7] = a[7] + b[7] * scale;
    out[8] = a[8] + b[8] * scale;
    out[9] = a[9] + b[9] * scale;
    out[10] = a[10] + b[10] * scale;
    out[11] = a[11] + b[11] * scale;
    out[12] = a[12] + b[12] * scale;
    out[13] = a[13] + b[13] * scale;
    out[14] = a[14] + b[14] * scale;
    out[15] = a[15] + b[15] * scale;
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4$1.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4$1.equals = function (a, b) {
    var a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        a4 = a[4],
        a5 = a[5],
        a6 = a[6],
        a7 = a[7],
        a8 = a[8],
        a9 = a[9],
        a10 = a[10],
        a11 = a[11],
        a12 = a[12],
        a13 = a[13],
        a14 = a[14],
        a15 = a[15];

    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3],
        b4 = b[4],
        b5 = b[5],
        b6 = b[6],
        b7 = b[7],
        b8 = b[8],
        b9 = b[9],
        b10 = b[10],
        b11 = b[11],
        b12 = b[12],
        b13 = b[13],
        b14 = b[14],
        b15 = b[15];

    return Math.abs(a0 - b0) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= glMatrix$6.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
};

var mat4_1 = mat4$1;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$8 = common;

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
var vec3$2 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3$2.create = function () {
    var out = new glMatrix$8.ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3$2.clone = function (a) {
    var out = new glMatrix$8.ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3$2.fromValues = function (x, y, z) {
    var out = new glMatrix$8.ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3$2.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3$2.set = function (out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3$2.sub = vec3$2.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.multiply = function (out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3$2.mul = vec3$2.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.divide = function (out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3$2.div = vec3$2.divide;

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
vec3$2.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
};

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
vec3$2.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    return out;
};

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.min = function (out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.max = function (out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
vec3$2.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3$2.scale = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3$2.scaleAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3$2.distance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3$2.dist = vec3$2.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3$2.squaredDistance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x * x + y * y + z * z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3$2.sqrDist = vec3$2.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3$2.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3$2.len = vec3$2.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3$2.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x * x + y * y + z * z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3$2.sqrLen = vec3$2.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3$2.negate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
vec3$2.inverse = function (out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3$2.normalize = function (out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x * x + y * y + z * z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3$2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3$2.cross = function (out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3$2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3$2.hermite = function (out, a, b, c, d, t) {
    var factorTimes2 = t * t,
        factor1 = factorTimes2 * (2 * t - 3) + 1,
        factor2 = factorTimes2 * (t - 2) + t,
        factor3 = factorTimes2 * (t - 1),
        factor4 = factorTimes2 * (3 - 2 * t);

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
};

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3$2.bezier = function (out, a, b, c, d, t) {
    var inverseFactor = 1 - t,
        inverseFactorTimesTwo = inverseFactor * inverseFactor,
        factorTimes2 = t * t,
        factor1 = inverseFactorTimesTwo * inverseFactor,
        factor2 = 3 * t * inverseFactorTimesTwo,
        factor3 = 3 * factorTimes2 * inverseFactor,
        factor4 = factorTimes2 * t;

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3$2.random = function (out, scale) {
    scale = scale || 1.0;

    var r = glMatrix$8.RANDOM() * 2.0 * Math.PI;
    var z = glMatrix$8.RANDOM() * 2.0 - 1.0;
    var zScale = Math.sqrt(1.0 - z * z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3$2.transformMat4 = function (out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3$2.transformMat3 = function (out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3$2.transformQuat = function (out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0],
        y = a[1],
        z = a[2],
        qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3],


    // calculate quat * vec
    ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3$2.rotateX = function (out, a, b, c) {
    var p = [],
        r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0];
    r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
    r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3$2.rotateY = function (out, a, b, c) {
    var p = [],
        r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3$2.rotateZ = function (out, a, b, c) {
    var p = [],
        r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
    r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
    r[2] = p[2];

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3$2.forEach = function () {
    var vec = vec3$2.create();

    return function (a, stride, offset, count, fn, arg) {
        var i, l;
        if (!stride) {
            stride = 3;
        }

        if (!offset) {
            offset = 0;
        }

        if (count) {
            l = Math.min(count * stride + offset, a.length);
        } else {
            l = a.length;
        }

        for (i = offset; i < l; i += stride) {
            vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
            fn(vec, vec, arg);
            a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
        }

        return a;
    };
}();

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
vec3$2.angle = function (a, b) {

    var tempA = vec3$2.fromValues(a[0], a[1], a[2]);
    var tempB = vec3$2.fromValues(b[0], b[1], b[2]);

    vec3$2.normalize(tempA, tempA);
    vec3$2.normalize(tempB, tempB);

    var cosine = vec3$2.dot(tempA, tempB);

    if (cosine > 1.0) {
        return 0;
    } else {
        return Math.acos(cosine);
    }
};

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3$2.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3$2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3$2.equals = function (a, b) {
    var a0 = a[0],
        a1 = a[1],
        a2 = a[2];
    var b0 = b[0],
        b1 = b[1],
        b2 = b[2];
    return Math.abs(a0 - b0) <= glMatrix$8.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix$8.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix$8.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
};

var vec3_1 = vec3$2;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$9 = common;

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */
var vec4$2 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4$2.create = function () {
    var out = new glMatrix$9.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4$2.clone = function (a) {
    var out = new glMatrix$9.ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4$2.fromValues = function (x, y, z, w) {
    var out = new glMatrix$9.ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4$2.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4$2.set = function (out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4$2.sub = vec4$2.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.multiply = function (out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4$2.mul = vec4$2.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.divide = function (out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4$2.div = vec4$2.divide;

/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */
vec4$2.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    out[3] = Math.ceil(a[3]);
    return out;
};

/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */
vec4$2.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    out[3] = Math.floor(a[3]);
    return out;
};

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.min = function (out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4$2.max = function (out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */
vec4$2.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    out[3] = Math.round(a[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4$2.scale = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4$2.scaleAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    out[3] = a[3] + b[3] * scale;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4$2.distance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4$2.dist = vec4$2.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4$2.squaredDistance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x * x + y * y + z * z + w * w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4$2.sqrDist = vec4$2.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4$2.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4$2.len = vec4$2.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4$2.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x * x + y * y + z * z + w * w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4$2.sqrLen = vec4$2.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4$2.negate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
vec4$2.inverse = function (out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    out[3] = 1.0 / a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4$2.normalize = function (out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x * x + y * y + z * z + w * w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4$2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4$2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4$2.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = glMatrix$9.RANDOM();
    out[1] = glMatrix$9.RANDOM();
    out[2] = glMatrix$9.RANDOM();
    out[3] = glMatrix$9.RANDOM();
    vec4$2.normalize(out, out);
    vec4$2.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4$2.transformMat4 = function (out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4$2.transformQuat = function (out, a, q) {
    var x = a[0],
        y = a[1],
        z = a[2],
        qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3],


    // calculate quat * vec
    ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out[3] = a[3];
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4$2.forEach = function () {
    var vec = vec4$2.create();

    return function (a, stride, offset, count, fn, arg) {
        var i, l;
        if (!stride) {
            stride = 4;
        }

        if (!offset) {
            offset = 0;
        }

        if (count) {
            l = Math.min(count * stride + offset, a.length);
        } else {
            l = a.length;
        }

        for (i = offset; i < l; i += stride) {
            vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
            fn(vec, vec, arg);
            a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
        }

        return a;
    };
}();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4$2.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4$2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4$2.equals = function (a, b) {
    var a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3];
    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    return Math.abs(a0 - b0) <= glMatrix$9.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix$9.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix$9.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix$9.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
};

var vec4_1 = vec4$2;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$7 = common;
var mat3$2 = mat3_1;
var vec3$1 = vec3_1;
var vec4$1 = vec4_1;

/**
 * @class Quaternion
 * @name quat
 */
var quat$1 = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat$1.create = function () {
    var out = new glMatrix$7.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat$1.rotationTo = function () {
    var tmpvec3 = vec3$1.create();
    var xUnitVec3 = vec3$1.fromValues(1, 0, 0);
    var yUnitVec3 = vec3$1.fromValues(0, 1, 0);

    return function (out, a, b) {
        var dot = vec3$1.dot(a, b);
        if (dot < -0.999999) {
            vec3$1.cross(tmpvec3, xUnitVec3, a);
            if (vec3$1.length(tmpvec3) < 0.000001) vec3$1.cross(tmpvec3, yUnitVec3, a);
            vec3$1.normalize(tmpvec3, tmpvec3);
            quat$1.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3$1.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat$1.normalize(out, out);
        }
    };
}();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat$1.setAxes = function () {
    var matr = mat3$2.create();

    return function (out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat$1.normalize(out, quat$1.fromMat3(out, matr));
    };
}();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat$1.clone = vec4$1.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat$1.fromValues = vec4$1.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat$1.copy = vec4$1.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat$1.set = vec4$1.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat$1.identity = function (out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat$1.setAxisAngle = function (out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {quat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
quat$1.getAxisAngle = function (out_axis, q) {
    var rad = Math.acos(q[3]) * 2.0;
    var s = Math.sin(rad / 2.0);
    if (s != 0.0) {
        out_axis[0] = q[0] / s;
        out_axis[1] = q[1] / s;
        out_axis[2] = q[2] / s;
    } else {
        // If s is zero, return any axis (no rotation - axis does not matter)
        out_axis[0] = 1;
        out_axis[1] = 0;
        out_axis[2] = 0;
    }
    return rad;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat$1.add = vec4$1.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat$1.multiply = function (out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat$1.mul = quat$1.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat$1.scale = vec4$1.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat$1.rotateX = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat$1.rotateY = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        by = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat$1.rotateZ = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bz = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat$1.calculateW = function (out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat$1.dot = vec4$1.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat$1.lerp = vec4$1.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat$1.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    var omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > 0.000001) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
};

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */
quat$1.sqlerp = function () {
    var temp1 = quat$1.create();
    var temp2 = quat$1.create();

    return function (out, a, b, c, d, t) {
        quat$1.slerp(temp1, a, d, t);
        quat$1.slerp(temp2, b, c, t);
        quat$1.slerp(out, temp1, temp2, 2 * t * (1 - t));

        return out;
    };
}();

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat$1.invert = function (out, a) {
    var a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
        invDot = dot ? 1.0 / dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat$1.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat$1.length = vec4$1.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat$1.len = quat$1.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat$1.squaredLength = vec4$1.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat$1.sqrLen = quat$1.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat$1.normalize = vec4$1.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat$1.fromMat3 = function (out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)
        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        var j = (i + 1) % 3;
        var k = (i + 2) % 3;

        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat$1.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat} a The first quaternion.
 * @param {quat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat$1.exactEquals = vec4$1.exactEquals;

/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {quat} a The first vector.
 * @param {quat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat$1.equals = vec4$1.equals;

var quat_1 = quat$1;

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix$10 = common;

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2$1 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2$1.create = function () {
    var out = new glMatrix$10.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2$1.clone = function (a) {
    var out = new glMatrix$10.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2$1.fromValues = function (x, y) {
    var out = new glMatrix$10.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2$1.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2$1.set = function (out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2$1.sub = vec2$1.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.multiply = function (out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2$1.mul = vec2$1.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.divide = function (out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2$1.div = vec2$1.divide;

/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to ceil
 * @returns {vec2} out
 */
vec2$1.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
};

/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to floor
 * @returns {vec2} out
 */
vec2$1.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
};

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.min = function (out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2$1.max = function (out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to round
 * @returns {vec2} out
 */
vec2$1.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2$1.scale = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2$1.scaleAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2$1.distance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2$1.dist = vec2$1.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2$1.squaredDistance = function (a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2$1.sqrDist = vec2$1.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2$1.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2$1.len = vec2$1.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2$1.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2$1.sqrLen = vec2$1.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2$1.negate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
vec2$1.inverse = function (out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2$1.normalize = function (out, a) {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2$1.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2$1.cross = function (out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2$1.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2$1.random = function (out, scale) {
    scale = scale || 1.0;
    var r = glMatrix$10.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2$1.transformMat2 = function (out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2$1.transformMat2d = function (out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2$1.transformMat3 = function (out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2$1.transformMat4 = function (out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2$1.forEach = function () {
    var vec = vec2$1.create();

    return function (a, stride, offset, count, fn, arg) {
        var i, l;
        if (!stride) {
            stride = 2;
        }

        if (!offset) {
            offset = 0;
        }

        if (count) {
            l = Math.min(count * stride + offset, a.length);
        } else {
            l = a.length;
        }

        for (i = offset; i < l; i += stride) {
            vec[0] = a[i];vec[1] = a[i + 1];
            fn(vec, vec, arg);
            a[i] = vec[0];a[i + 1] = vec[1];
        }

        return a;
    };
}();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2$1.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2$1.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2$1.equals = function (a, b) {
    var a0 = a[0],
        a1 = a[1];
    var b0 = b[0],
        b1 = b[1];
    return Math.abs(a0 - b0) <= glMatrix$10.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix$10.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
};

var vec2_1 = vec2$1;

var mat4 = mat4_1;
var quat = quat_1;
var vec2 = vec2_1;
var vec3 = vec3_1;
var vec4 = vec4_1;

class Vector3 extends VectorBase {
    constructor(x, y, z) {
        super();
        if (typeof y === "undefined") {
            this.rawElements = x;
            return;
        }
        this.rawElements = [x, y, z];
    }
    static get XUnit() {
        return new Vector3(1, 0, 0);
    }
    static get YUnit() {
        return new Vector3(0, 1, 0);
    }
    static get ZUnit() {
        return new Vector3(0, 0, 1);
    }
    static get Zero() {
        return new Vector3(0, 0, 0);
    }
    static get One() {
        return new Vector3(1, 1, 1);
    }
    static copy(source) {
        return new Vector3(source.X, source.Y, source.Z);
    }
    static dot(v1, v2) {
        return vec3.dot(v1.rawElements, v2.rawElements);
    }
    static add(v1, v2) {
        const newVec = vec3.create();
        return new Vector3(vec3.add(newVec, v1.rawElements, v2.rawElements));
    }
    static subtract(v1, v2) {
        const newVec = vec3.create();
        return new Vector3(vec3.sub(newVec, v1.rawElements, v2.rawElements));
    }
    static multiply(s, v) {
        const newVec = vec3.create();
        return new Vector3(vec3.scale(newVec, v.rawElements, s));
    }
    static negate(v1) {
        return Vector3.multiply(-1, v1);
    }
    static equals(v1, v2) {
        return VectorBase.__elementEquals(v1, v2);
    }
    static nearlyEquals(v1, v2) {
        return VectorBase.__nearlyElementEquals(v1, v2);
    }
    static normalize(v1) {
        const newVec = vec3.create();
        return new Vector3(vec3.normalize(newVec, v1.rawElements));
    }
    static cross(v1, v2) {
        const newVec = vec3.create();
        return new Vector3(vec3.cross(newVec, v1.rawElements, v2.rawElements));
    }
    static min(v1, v2) {
        return new Vector3(VectorBase.__fromGenerationFunction(v1, v2, (i, _v1, _v2) => Math.min(_v1.rawElements[i], _v2.rawElements[i])));
    }
    static max(v1, v2) {
        return new Vector3(VectorBase.__fromGenerationFunction(v1, v2, (i, _v1, _v2) => Math.max(_v1.rawElements[i], _v2.rawElements[i])));
    }
    static angle(v1, v2) {
        return Math.acos(Vector3.dot(v1.normalized, v2.normalized));
    }
    static parse(str) {
        const parseResult = VectorBase.__parse(str);
        const elements = parseResult.elements;
        if (!elements || elements.length !== 1 && elements.length !== 3) {
            return undefined;
        }
        let result;
        if (elements.length === 1) {
            result = new Vector3(elements[0], elements[0], elements[0]);
        } else {
            result = new Vector3(elements[0], elements[1], elements[2]);
        }
        if (parseResult.needNormalize) {
            result = result.normalizeThis();
        }
        if (parseResult.coefficient) {
            result = result.multiplyWith(parseResult.coefficient);
        }
        if (parseResult.needNegate) {
            result = result.negateThis();
        }
        return result;
    }
    toMathematicaString() {
        return `{${ this.X },${ this.Y },${ this.Z }}`;
    }
    get normalized() {
        return this.multiplyWith(1 / this.magnitude);
    }
    get X() {
        return this.rawElements[0];
    }
    get Y() {
        return this.rawElements[1];
    }
    get Z() {
        return this.rawElements[2];
    }
    set X(x) {
        this.rawElements[0] = +x;
    }
    set Y(y) {
        this.rawElements[1] = +y;
    }
    set Z(z) {
        this.rawElements[2] = +z;
    }
    normalizeThis() {
        return Vector3.normalize(this);
    }
    dotWith(v) {
        return Vector3.dot(this, v);
    }
    addWith(v) {
        return Vector3.add(this, v);
    }
    subtractWith(v) {
        return Vector3.subtract(this, v);
    }
    multiplyWith(s) {
        return Vector3.multiply(s, this);
    }
    negateThis() {
        return Vector3.negate(this);
    }
    equalWith(v) {
        return Vector3.equals(this, v);
    }
    nearlyEqualWith(v) {
        return Vector3.nearlyEquals(this, v);
    }
    crossWith(v) {
        return Vector3.cross(this, v);
    }
    toString() {
        return `(${ this.X }, ${ this.Y }, ${ this.Z })`;
    }
    toDisplayString() {
        return `Vector3${ this.toString() }`;
    }
    get ElementCount() {
        return 3;
    }
}

class Vector4 extends VectorBase {
    constructor(x, y, z, w) {
        super();
        if (typeof y === "undefined") {
            this.rawElements = x;
            return;
        }
        this.rawElements = [x, y, z, w];
    }
    static get XUnit() {
        return new Vector4(1, 0, 0, 0);
    }
    static get YUnit() {
        return new Vector4(0, 1, 0, 0);
    }
    static get ZUnit() {
        return new Vector4(0, 0, 1, 0);
    }
    static get WUnit() {
        return new Vector4(0, 0, 0, 1);
    }
    static get One() {
        return new Vector4(1, 1, 1, 1);
    }
    static get Zero() {
        return new Vector4(0, 0, 0, 0);
    }
    static copy(vec) {
        return new Vector4(vec.X, vec.Y, vec.Z, vec.W);
    }
    static dot(v1, v2) {
        return vec4.dot(v1.rawElements, v2.rawElements);
    }
    static add(v1, v2) {
        const newVec = vec4.create();
        return new Vector4(vec4.add(newVec, v1.rawElements, v2.rawElements));
    }
    static subtract(v1, v2) {
        const newVec = vec4.create();
        return new Vector4(vec4.sub(newVec, v1.rawElements, v2.rawElements));
    }
    static multiply(s, v) {
        const newVec = vec4.create();
        return new Vector4(vec4.scale(newVec, v.rawElements, s));
    }
    static negate(v1) {
        return Vector4.multiply(-1, v1);
    }
    static equals(v1, v2) {
        return VectorBase.__elementEquals(v1, v2);
    }
    static nearlyEquals(v1, v2) {
        return VectorBase.__nearlyElementEquals(v1, v2);
    }
    static normalize(v1) {
        const newVec = vec4.create();
        return new Vector4(vec4.normalize(newVec, v1.rawElements));
    }
    static min(v1, v2) {
        return new Vector4(VectorBase.__fromGenerationFunction(v1, v2, (i, _v1, _v2) => Math.min(_v1.rawElements[i], _v2.rawElements[i])));
    }
    static max(v1, v2) {
        return new Vector4(VectorBase.__fromGenerationFunction(v1, v2, (i, _v1, _v2) => Math.max(_v1.rawElements[i], _v2.rawElements[i])));
    }
    static angle(v1, v2) {
        return Math.acos(Vector4.dot(v1.normalized, v2.normalized));
    }
    static parse(str) {
        const parseResult = VectorBase.__parse(str);
        const elements = parseResult.elements;
        if (!elements || elements.length !== 1 && elements.length !== 4) {
            return undefined;
        }
        let result;
        if (elements.length === 1) {
            result = new Vector4(elements[0], elements[0], elements[0], elements[0]);
        } else {
            result = new Vector4(elements[0], elements[1], elements[2], elements[3]);
        }
        if (parseResult.needNormalize) {
            result = result.normalizeThis();
        }
        if (parseResult.coefficient) {
            result = result.multiplyWith(parseResult.coefficient);
        }
        if (parseResult.needNegate) {
            result = result.negateThis();
        }
        return result;
    }
    get normalized() {
        return this.multiplyWith(1 / this.magnitude);
    }
    get X() {
        return this.rawElements[0];
    }
    get Y() {
        return this.rawElements[1];
    }
    get Z() {
        return this.rawElements[2];
    }
    get W() {
        return this.rawElements[3];
    }
    set X(x) {
        this.rawElements[0] = +x;
    }
    set Y(y) {
        this.rawElements[1] = +y;
    }
    set Z(z) {
        this.rawElements[2] = +z;
    }
    set W(w) {
        this.rawElements[3] = +w;
    }
    normalizeThis() {
        return Vector4.normalize(this);
    }
    dotWith(v) {
        return Vector4.dot(this, v);
    }
    addWith(v) {
        return Vector4.add(this, v);
    }
    subtractWith(v) {
        return Vector4.subtract(this, v);
    }
    multiplyWith(s) {
        return Vector4.multiply(s, this);
    }
    negateThis() {
        return Vector4.negate(this);
    }
    equalWith(v) {
        return Vector4.equals(this, v);
    }
    nearlyEqualWith(v) {
        return Vector4.nearlyEquals(this, v);
    }
    get ElementCount() {
        return 4;
    }
    toString() {
        return `(${ this.X }, ${ this.Y }, ${ this.Z }, ${ this.W })`;
    }
    toDisplayString() {
        return `Vector4${ this.toString() }`;
    }
    toMathematicaString() {
        return `{${ this.X },${ this.Y },${ this.Z },${ this.W }}`;
    }
}

var Colors = {
    "aliceblue": "#F0F8FF",
    "antiquewhite": "#FAEBD7",
    "aqua": "#00FFFF",
    "aquamarine": "#7FFFD4",
    "azure": "#F0FFFF",
    "beige": "#F5F5DC",
    "bisque": "#FFE4C4",
    "black": "#000000",
    "blanchedalmond": "#FFEBCD",
    "blue": "#0000FF",
    "blueviolet": "#8A2BE2",
    "brown": "#A52A2A",
    "burlywood": "#DEB887",
    "cadetblue": "#5F9EA0",
    "chartreuse": "#7FFF00",
    "chocolate": "#D2691E",
    "coral": "#FF7F50",
    "cornflowerblue": "#6495ED",
    "cornsilk": "#FFF8DC",
    "crimson": "#DC143C",
    "cyan": "#00FFFF",
    "darkblue": "#00008B",
    "darkcyan": "#008B8B",
    "darkgoldenrod": "#B8860B",
    "darkgray": "#A9A9A9",
    "darkgreen": "#006400",
    "darkgrey": "#A9A9A9",
    "darkkhaki": "#BDB76B",
    "darkmagenta": "#8B008B",
    "darkolivegreen": "#556B2F",
    "darkorange": "#FF8C00",
    "darkorchid": "#9932CC",
    "darkred": "#8B0000",
    "darksalmon": "#E9967A",
    "darkseagreen": "#8FBC8F",
    "darkslateblue": "#483D8B",
    "darkslategray": "#2F4F4F",
    "darkslategrey": "#2F4F4F",
    "darkturquoise": "#00CED1",
    "darkviolet": "#9400D3",
    "deeppink": "#FF1493",
    "deepskyblue": "#00BFFF",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1E90FF",
    "firebrick": "#B22222",
    "floralwhite": "#FFFAF0",
    "forestgreen": "#228B22",
    "fuchsia": "#FF00FF",
    "gainsboro": "#DCDCDC",
    "ghostwhite": "#F8F8FF",
    "gold": "#FFD700",
    "goldenrod": "#DAA520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#ADFF2F",
    "grey": "#808080",
    "honeydew": "#F0FFF0",
    "hotpink": "#FF69B4",
    "indianred": "#CD5C5C",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "lavenderblush": "#FFF0F5",
    "lawngreen": "#7CFC00",
    "lemonchiffon": "#FFFACD",
    "lightblue": "#ADD8E6",
    "lightcoral": "#F08080",
    "lightcyan": "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgray": "#D3D3D3",
    "lightgreen": "#90EE90",
    "lightgrey": "#D3D3D3",
    "lightpink": "#FFB6C1",
    "lightsalmon": "#FFA07A",
    "lightseagreen": "#20B2AA",
    "lightskyblue": "#87CEFA",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#B0C4DE",
    "lightyellow": "#FFFFE0",
    "lime": "#00FF00",
    "limegreen": "#32CD32",
    "linen": "#FAF0E6",
    "magenta": "#FF00FF",
    "maroon": "#800000",
    "mediumaquamarine": "#66CDAA",
    "mediumblue": "#0000CD",
    "mediumorchid": "#BA55D3",
    "mediumpurple": "#9370DB",
    "mediumseagreen": "#3CB371",
    "mediumslateblue": "#7B68EE",
    "mediumspringgreen": "#00FA9A",
    "mediumturquoise": "#48D1CC",
    "mediumvioletred": "#C71585",
    "midnightblue": "#191970",
    "mintcream": "#F5FFFA",
    "mistyrose": "#FFE4E1",
    "moccasin": "#FFE4B5",
    "navajowhite": "#FFDEAD",
    "navy": "#000080",
    "oldlace": "#FDF5E6",
    "olive": "#808000",
    "olivedrab": "#6B8E23",
    "orange": "#FFA500",
    "orangered": "#FF4500",
    "orchid": "#DA70D6",
    "palegoldenrod": "#EEE8AA",
    "palegreen": "#98FB98",
    "paleturquoise": "#AFEEEE",
    "palevioletred": "#DB7093",
    "papayawhip": "#FFEFD5",
    "peachpuff": "#FFDAB9",
    "peru": "#CD853F",
    "pink": "#FFC0CB",
    "plum": "#DDA0DD",
    "powderblue": "#B0E0E6",
    "purple": "#800080",
    "red": "#FF0000",
    "rosybrown": "#BC8F8F",
    "royalblue": "#4169E1",
    "saddlebrown": "#8B4513",
    "salmon": "#FA8072",
    "sandybrown": "#F4A460",
    "seagreen": "#2E8B57",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "silver": "#C0C0C0",
    "skyblue": "#87CEEB",
    "slateblue": "#6A5ACD",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#FFFAFA",
    "springgreen": "#00FF7F",
    "steelblue": "#4682B4",
    "tan": "#D2B48C",
    "teal": "#008080",
    "thistle": "#D8BFD8",
    "tomato": "#FF6347",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "wheat": "#F5DEB3",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "yellow": "#FFFF00",
    "yellowgreen": "#9ACD32"
};

class Color4 extends VectorBase {
    constructor(r, g, b, a) {
        super();
        this.rawElements = [r, g, b, a];
    }
    /// Color parser for css like syntax
    static internalParse(color, isFirst, tryParse) {
        if (isFirst && Colors[color]) {
            return Color4.internalParse(Colors[color], false);
        }
        let m;
        if (isFirst) {
            m = color.match(/^#([0-9a-f]{3})$/i);
            // #fff
            if (m) {
                const s = m[1];
                return new Color4(parseInt(s.charAt(0), 16) / 0xf, parseInt(s.charAt(1), 16) / 0xf, parseInt(s.charAt(2), 16) / 0xf, 1);
            }
        }
        if (isFirst) {
            m = color.match(/^#([0-9a-f]{4})$/i);
            // #ffff
            if (m) {
                const s = m[1];
                return new Color4(parseInt(s.charAt(0), 16) / 0xf, parseInt(s.charAt(1), 16) / 0xf, parseInt(s.charAt(2), 16) / 0xf, parseInt(s.charAt(3), 16) / 0xf);
            }
        }
        // #ffffff
        m = color.match(/^#([0-9a-f]{6})$/i);
        if (m) {
            const s = m[1];
            return new Color4(parseInt(s.substr(0, 2), 16) / 0xff, parseInt(s.substr(2, 2), 16) / 0xff, parseInt(s.substr(4, 2), 16) / 0xff, 1);
        }
        // #ffffffff
        if (isFirst) {
            m = color.match(/^#([0-9a-f]{8})$/i);
            if (m) {
                const s = m[1];
                return new Color4(parseInt(s.substr(0, 2), 16) / 0xff, parseInt(s.substr(2, 2), 16) / 0xff, parseInt(s.substr(4, 2), 16) / 0xff, parseInt(s.substr(6, 2), 16) / 0xff);
            }
        }
        let n = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (n && isFirst) {
            return new Color4(parseInt(n[1], 10) / 0xff, parseInt(n[2], 10) / 0xff, parseInt(n[3], 10) / 0xff, 1);
        }
        n = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*(\d+)\s*\)$/i);
        if (n && isFirst) {
            let d = parseInt(n[4], 10);
            d = d <= 1 ? d : d / 0xff;
            return new Color4(parseInt(n[1], 10) / 0xff, parseInt(n[2], 10) / 0xff, parseInt(n[3], 10) / 0xff, parseInt(n[4], 10));
        }
        if (tryParse) {
            return undefined;
        }
        throw new Error("Unexpected color string" + color);
    }
    static parse(color, tryParse) {
        return Color4.internalParse(color, true, tryParse);
    }
    static equals(col1, col2) {
        return VectorBase.__elementEquals(col1, col2);
    }
    get R() {
        return this.rawElements[0];
    }
    get G() {
        return this.rawElements[1];
    }
    get B() {
        return this.rawElements[2];
    }
    get A() {
        return this.rawElements[3];
    }
    toVector() {
        return new Vector4(this.R, this.G, this.B, this.A);
    }
    get ElementCount() {
        return 4;
    }
    equalWith(col) {
        return Color4.equals(col, this);
    }
    toString() {
        return `rgba(${ Math.round(this.R * 255) }, ${ Math.round(this.G * 255) }, ${ Math.round(this.B * 255) }, ${ Math.round(this.A * 255) })`;
    }
    toDisplayString() {
        let st = "#";
        st += Math.round(this.R * 0xff).toString(16).toUpperCase();
        st += Math.round(this.G * 0xff).toString(16).toUpperCase();
        st += Math.round(this.B * 0xff).toString(16).toUpperCase();
        st += Math.round(this.A * 0xff).toString(16).toUpperCase();
        return `Color4(${ this.R }, ${ this.G }, ${ this.B }, ${ this.A }, ${ st })`;
    }
}

class Color3 extends VectorBase {
    constructor(r, g, b) {
        super();
        this.rawElements = [r, g, b];
    }
    static fromColor4(col) {
        return new Color3(col.R, col.G, col.B);
    }
    static parse(color, tryParse) {
        return Color3.internalParse(color, true, tryParse);
    }
    /// Color parser for css like syntax
    static internalParse(color, isFirst, tryParse) {
        if (isFirst && Colors[color]) {
            const col = Color4.internalParse(Colors[color], false, tryParse);
            return Color3.fromColor4(col);
        }
        let m;
        if (isFirst) {
            m = color.match(/^#([0-9a-f]{3})$/i);
            // #fff
            if (m) {
                const s = m[1];
                return new Color3(parseInt(s.charAt(0), 16) / 0xf, parseInt(s.charAt(1), 16) / 0xf, parseInt(s.charAt(2), 16) / 0xf);
            }
        }
        // #ffffff
        m = color.match(/^#([0-9a-f]{6})$/i);
        if (m) {
            const s = m[1];
            return new Color3(parseInt(s.substr(0, 2), 16) / 0xff, parseInt(s.substr(2, 2), 16) / 0xff, parseInt(s.substr(4, 2), 16) / 0xff);
        }
        const n = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (n && isFirst) {
            return new Color3(parseInt(n[1], 10) / 0xff, parseInt(n[2], 10) / 0xff, parseInt(n[3], 10) / 0xff);
        }
        if (tryParse) {
            return undefined;
        }
        throw new Error("Unexpected color string" + color);
    }
    static equals(col1, col2) {
        return VectorBase.__elementEquals(col1, col2);
    }
    toVector() {
        return new Vector3(this.R, this.G, this.B);
    }
    toVector4(a) {
        if (typeof a === "undefined") {
            a = 0;
        }
        return new Vector4(this.R, this.G, this.B, a);
    }
    get R() {
        return this.rawElements[0];
    }
    get G() {
        return this.rawElements[1];
    }
    get B() {
        return this.rawElements[2];
    }
    get ElementCount() {
        return 3;
    }
    equalWith(col) {
        return Color3.equals(col, this);
    }
    toString() {
        return `rgb(${ Math.round(this.R * 255) }, ${ Math.round(this.G * 255) }, ${ Math.round(this.B * 255) })`;
    }
    toDisplayString() {
        let st = "#";
        st += Math.round(this.R * 0xff).toString(16).toUpperCase();
        st += Math.round(this.G * 0xff).toString(16).toUpperCase();
        st += Math.round(this.B * 0xff).toString(16).toUpperCase();
        return `Color3(${ this.R }, ${ this.G }, ${ this.B }, ${ st })`;
    }
}

class Vector2 extends VectorBase {
    constructor(x, y) {
        super();
        if (typeof y === "undefined") {
            this.rawElements = x;
            return;
        }
        this.rawElements = [x, y];
    }
    static get XUnit() {
        return new Vector2(1, 0);
    }
    static get YUnit() {
        return new Vector2(0, 1);
    }
    static get One() {
        return new Vector2(1, 1);
    }
    static get Zero() {
        return new Vector2(0, 0);
    }
    static copy(vec) {
        return new Vector2(vec.X, vec.Y);
    }
    static parse(str) {
        const parseResult = VectorBase.__parse(str);
        const elements = parseResult.elements;
        if (elements.length !== 1 && elements.length !== 2) {
            return undefined;
        }
        let result;
        if (elements.length === 1) {
            result = new Vector2(elements[0], elements[0]);
        } else {
            result = new Vector2(elements[0], elements[1]);
        }
        if (parseResult.needNormalize) {
            result = result.normalizeThis();
        }
        if (parseResult.coefficient) {
            result = result.multiplyWith(parseResult.coefficient);
        }
        if (parseResult.needNegate) {
            result = result.negateThis();
        }
        return result;
    }
    static dot(v1, v2) {
        return vec2.dot(v1.rawElements, v2.rawElements);
    }
    static add(v1, v2) {
        const newVec = vec2.create();
        return new Vector2(vec2.add(newVec, v1.rawElements, v2.rawElements));
    }
    static subtract(v1, v2) {
        const newVec = vec2.create();
        return new Vector2(vec2.sub(newVec, v1.rawElements, v2.rawElements));
    }
    static multiply(s, v) {
        const newVec = vec2.create();
        return new Vector2(vec2.scale(newVec, v.rawElements, s));
    }
    static negate(v1) {
        return Vector2.multiply(-1, v1);
    }
    static equals(v1, v2) {
        return VectorBase.__elementEquals(v1, v2);
    }
    static nearlyEquals(v1, v2) {
        return VectorBase.__nearlyElementEquals(v1, v2);
    }
    static normalize(v1) {
        const newVec = vec2.create();
        return new Vector2(vec2.normalize(newVec, v1.rawElements));
    }
    static min(v1, v2) {
        return new Vector2(VectorBase.__fromGenerationFunction(v1, v2, (i, v1_, v2_) => Math.min(v1_.rawElements[i], v2_.rawElements[i])));
    }
    static max(v1, v2) {
        return new Vector2(VectorBase.__fromGenerationFunction(v1, v2, (i, v1_, v2_) => Math.max(v1_.rawElements[i], v2_.rawElements[i])));
    }
    static angle(v1, v2) {
        return Math.acos(Vector2.dot(v1.normalized, v2.normalized));
    }
    get normalized() {
        return this.multiplyWith(1 / this.magnitude);
    }
    get X() {
        return this.rawElements[0];
    }
    get Y() {
        return this.rawElements[1];
    }
    set X(x) {
        this.rawElements[0] = +x;
    }
    set Y(y) {
        this.rawElements[1] = +y;
    }
    dotWith(v) {
        return Vector2.dot(this, v);
    }
    addWith(v) {
        return Vector2.add(this, v);
    }
    subtractWith(v) {
        return Vector2.subtract(v, this);
    }
    multiplyWith(s) {
        return Vector2.multiply(s, this);
    }
    negateThis() {
        return Vector2.negate(this);
    }
    equalWith(v) {
        return Vector2.equals(this, v);
    }
    nearlyEqualWith(v) {
        return Vector2.nearlyEquals(this, v);
    }
    normalizeThis() {
        return Vector2.normalize(this);
    }
    toString() {
        return `(${ this.X }, ${ this.Y })`;
    }
    toDisplayString() {
        return `Vector2${ this.toString() }`;
    }
    get ElementCount() {
        return 2;
    }
    toMathematicaString() {
        return `{${ this.X }, ${ this.Y }}`;
    }
}

class MatrixBase {
    static __elementEquals(m1, m2) {
        if (m1.RowCount !== m2.RowCount || m1.ColmunCount !== m2.ColmunCount) {
            return false;
        }
        const count = m1.RowCount * m2.ColmunCount;
        for (let i = 0; i < count; i++) {
            if (m1.getBySingleIndex(i) !== m2.getBySingleIndex(i)) {
                return false;
            }
        }
        return true;
    }
    get RowCount() {
        return 0;
    }
    get ColmunCount() {
        return 0;
    }
    getAt(row, colmun) {
        throw new Error("Not implemented");
    }
    getBySingleIndex(index) {
        throw new Error("Not implemented");
    }
}

class Matrix extends MatrixBase {
    constructor(arr) {
        super();
        if (arr) {
            this.rawElements = arr;
        } else {
            this.rawElements = mat4.create();
        }
    }
    static zero() {
        return new Matrix([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    static identity() {
        return new Matrix(mat4.create());
    }
    static fromElements(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        return new Matrix([m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]);
    }
    static fromFunc(f) {
        return new Matrix([f(0, 0), f(1, 0), f(2, 0), f(3, 0), f(0, 1), f(1, 1), f(2, 1), f(3, 1), f(0, 2), f(1, 2), f(2, 2), f(3, 2), f(0, 3), f(1, 3), f(2, 3), f(3, 3)]);
    }
    static equals(m1, m2) {
        return Matrix.__elementEquals(m1, m2);
    }
    static add(m1, m2) {
        const mat = mat4.create();
        for (let i = 0; i < 16; i++) {
            mat[i] = m1.rawElements[i] + m2.rawElements[i];
        }
        return new Matrix(mat);
    }
    static subtract(m1, m2) {
        return Matrix.add(m1, Matrix.negate(m2));
    }
    static scalarMultiply(s, m) {
        const newMat = mat4.create();
        mat4.multiply(newMat, [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, s], m.rawElements);
        return new Matrix(newMat);
    }
    static multiply(m1, m2) {
        const newMat = mat4.create();
        return new Matrix(mat4.mul(newMat, m1.rawElements, m2.rawElements));
    }
    static trs(t, rot, s) {
        const newMat = mat4.create();
        const cacheMat = mat4.create();
        mat4.mul(newMat, mat4.translate(newMat, mat4.create(), t.rawElements), mat4.fromQuat(cacheMat, rot.rawElements));
        mat4.scale(newMat, newMat, s.rawElements);
        return new Matrix(newMat);
    }
    static negate(m) {
        return this.scalarMultiply(-1, m);
    }
    static transpose(m) {
        const newMat = mat4.create();
        return new Matrix(mat4.transpose(newMat, m.rawElements));
    }
    static transformPoint(m, t) {
        const newVec = vec3.create();
        vec3.transformMat4(newVec, t.rawElements, m.rawElements);
        return new Vector3(newVec);
    }
    static transformNormal(m, t) {
        const newVec = vec4.create();
        const trans = vec4.create();
        trans[0] = t.X;
        trans[1] = t.Y;
        trans[2] = t.Z;
        trans[3] = 0;
        vec4.transformMat4(newVec, trans, m.rawElements);
        return new Vector3(newVec[0], newVec[1], newVec[2]);
    }
    static transform(m, t) {
        const newVec = vec4.create();
        const trans = vec4.create();
        trans[0] = t.X;
        trans[1] = t.Y;
        trans[2] = t.Z;
        trans[3] = t.W;
        vec4.transformMat4(newVec, trans, m.rawElements);
        return new Vector4(newVec[0], newVec[1], newVec[2], newVec[3]);
    }
    /**
     * Retrieve determinant of passed matrix
     */
    static determinant(m) {
        return mat4.determinant(m.rawElements);
    }
    /**
     * Compute inverted passed matrix.
     */
    static inverse(m) {
        const newMat = mat4.create();
        return new Matrix(mat4.invert(newMat, m.rawElements));
    }
    /**
     * Generate linear translation transform matrix.
     */
    static translate(v) {
        const newMat = mat4.create();
        mat4.translate(newMat, newMat, v.rawElements);
        return new Matrix(newMat);
    }
    /**
     * Generate linear scaling transform matrix.
     */
    static scale(v) {
        const newMat = mat4.create();
        mat4.scale(newMat, newMat, v.rawElements);
        return new Matrix(newMat);
    }
    static rotateX(angle) {
        const newMat = mat4.create();
        mat4.rotateX(newMat, newMat, angle);
        return new Matrix(newMat);
    }
    static rotateY(angle) {
        const newMat = mat4.create();
        mat4.rotateY(newMat, newMat, angle);
        return new Matrix(newMat);
    }
    static rotateZ(angle) {
        const newMat = mat4.create();
        mat4.rotateZ(newMat, newMat, angle);
        return new Matrix(newMat);
    }
    static rotationQuaternion(quat_) {
        const quaternion = quat.create();
        const newMat = mat4.create();
        quat.normalize(quaternion, quat_.rawElements);
        mat4.fromQuat(newMat, quaternion);
        return new Matrix(newMat);
    }
    static frustum(left, right, bottom, top, near, far) {
        const newMat = mat4.create();
        mat4.frustum(newMat, left, right, bottom, top, near, far);
        return new Matrix(newMat);
    }
    static ortho(left, right, bottom, top, near, far) {
        const newMat = mat4.create();
        mat4.ortho(newMat, left, right, bottom, top, near, far);
        return new Matrix(newMat);
    }
    static perspective(fovy, aspect, near, far) {
        const newMat = mat4.create();
        mat4.perspective(newMat, fovy, aspect, near, far);
        return new Matrix(newMat);
    }
    static lookAt(eye, lookAt, up) {
        const newMat = mat4.create();
        mat4.lookAt(newMat, eye.rawElements, lookAt.rawElements, up.rawElements);
        return new Matrix(newMat);
    }
    getAt(row, colmun) {
        return this.rawElements[colmun * 4 + row];
    }
    setAt(row, colmun, val) {
        this.rawElements[colmun * 4 + row] = val;
    }
    getBySingleIndex(index) {
        return this.rawElements[index];
    }
    getColmun(col) {
        return new Vector4(this.rawElements[col * 4], this.rawElements[col * 4 + 1], this.rawElements[col * 4 + 2], this.rawElements[col * 4 + 3]);
    }
    /**
    * Get row
    * @params row [0-3]
    */
    getRow(row) {
        return new Vector4(this.rawElements[row], this.rawElements[row + 4], this.rawElements[row + 8], this.rawElements[row + 12]);
    }
    multiplyWith(m) {
        return Matrix.multiply(this, m);
    }
    equalWith(m) {
        return Matrix.equals(m, this);
    }
    toString() {
        return `|${ this.getBySingleIndex(0) } ${ this.getBySingleIndex(4) } ${ this.getBySingleIndex(8) } ${ this.getBySingleIndex(12) }|\n
                 |${ this.getBySingleIndex(1) } ${ this.getBySingleIndex(5) } ${ this.getBySingleIndex(9) } ${ this.getBySingleIndex(13) }|\n
                 |${ this.getBySingleIndex(2) } ${ this.getBySingleIndex(6) } ${ this.getBySingleIndex(10) } ${ this.getBySingleIndex(14) }|\n
                 |${ this.getBySingleIndex(3) } ${ this.getBySingleIndex(7) } ${ this.getBySingleIndex(11) } ${ this.getBySingleIndex(15) }|`;
    }
    toMathematicaString() {
        return `{{${ this.getBySingleIndex(0) },${ this.getBySingleIndex(4) },${ this.getBySingleIndex(8) },${ this.getBySingleIndex(12) }},
                  {${ this.getBySingleIndex(1) },${ this.getBySingleIndex(5) },${ this.getBySingleIndex(9) },${ this.getBySingleIndex(13) }},
                  {${ this.getBySingleIndex(2) },${ this.getBySingleIndex(6) },${ this.getBySingleIndex(10) },${ this.getBySingleIndex(14) }},
                  {${ this.getBySingleIndex(3) },${ this.getBySingleIndex(7) },${ this.getBySingleIndex(11) },${ this.getBySingleIndex(15) }}}`;
    }
    get ElementCount() {
        return 16;
    }
    get RowCount() {
        return 4;
    }
    get ColmunCount() {
        return 4;
    }
}

/**
* The class to maniplate quaternion.
* Basically,you don't need to operate raw element.
* You consider to use some of useful methods without editing raw element forcelly.
* Each element will be represented as (w;x,y,z)
* (1,i,j,k) is base axis for quaternion. (i,j,k is pure imaginary number)
* (w;x,y,z) means w*1+x*i+y*j+z*k
*
*/
class Quaternion {
    /**
    * Constructor by specifing each elements.
    */
    constructor(rawElements) {
        this.rawElements = rawElements;
    }
    static equals(q1, q2) {
        for (let i = 0; i < 4; i++) {
            if (q1.rawElements[i] !== q2.rawElements[i]) {
                return false;
            }
        }
        return true;
    }
    /**
    * Calculate add result of two quaternion
    */
    static add(q1, q2) {
        const newQuat = quat.create();
        return new Quaternion(quat.add(newQuat, q1.rawElements, q2.rawElements));
    }
    /**
    * Calculate multiply result of two quaternion
    */
    static multiply(q1, q2) {
        const newQuat = quat.create();
        return new Quaternion(quat.mul(newQuat, q1.rawElements, q2.rawElements));
    }
    /**
    * Calculate the rotation quaternion represented as pair of angle and axis.
    */
    static angleAxis(angle, axis) {
        const axisVec = vec3.create();
        axisVec[0] = axis.X;
        axisVec[1] = axis.Y;
        axisVec[2] = axis.Z;
        const newQuat = quat.create();
        return new Quaternion(quat.setAxisAngle(newQuat, axisVec, +angle));
    }
    static euler(x, y, z) {
        return Quaternion.multiply(Quaternion.angleAxis(z, Vector3.ZUnit), Quaternion.multiply(Quaternion.angleAxis(x, Vector3.XUnit), Quaternion.angleAxis(y, Vector3.YUnit)));
    }
    static eulerXYZ(x, y, z) {
        return Quaternion.multiply(Quaternion.angleAxis(z, Vector3.ZUnit), Quaternion.multiply(Quaternion.angleAxis(y, Vector3.YUnit), Quaternion.angleAxis(x, Vector3.XUnit)));
    }
    static slerp(q1, q2, t) {
        const newQuat = quat.create();
        return new Quaternion(quat.slerp(newQuat, q1.rawElements, q2.rawElements, +t));
    }
    /**
     * Returns the angle in degrees between two rotations q1 and q2.
     * @param q1 the quaternion represents begin angle.
     * @param q2 the quaternion represents end angle.
     * @returns {number} angle represented in radians.
     */
    static angle(q1, q2) {
        let delta = Quaternion.multiply(q2, q1.inverse());
        delta = delta.normalize();
        return 2 * Math.acos(delta.W);
    }
    static fromToRotation(from, to) {
        const crossed = Vector3.cross(from.normalized, to.normalized);
        const angle = Vector3.dot(from.normalized, to.normalized);
        return Quaternion.angleAxis(angle, crossed);
    }
    static lookRotation(forward, upVec) {
        upVec = upVec || Vector3.YUnit;
        const normalizedForward = forward.normalized;
        const upForwardCross = Vector3.cross(upVec, normalizedForward).normalized;
        const thirdAxis = Vector3.cross(normalizedForward, upForwardCross);
        const m00 = upForwardCross.X;
        const m01 = upForwardCross.Y;
        const m02 = upForwardCross.Z;
        const m10 = thirdAxis.X;
        const m11 = thirdAxis.Y;
        const m12 = thirdAxis.Z;
        const m20 = normalizedForward.X;
        const m21 = normalizedForward.Y;
        const m22 = normalizedForward.Z;
        const num8 = m00 + m11 + m22;
        if (num8 > 0) {
            const num = Math.sqrt(1 + num8);
            return new Quaternion([(m12 - m21) * 0.5 / num, (m20 - m02) * 0.5 / num, (m01 - m10) * 0.5 / num, num / 2]);
        }
        if (m00 >= m11 && m00 >= m22) {
            const num7 = Math.sqrt(1 + m00 - m11 - m22);
            return new Quaternion([(m01 + m10) * 0.5 / num7, (m02 + m20) * 0.5 / num7, (m12 - m21) * 0.5 / num7, num7 / 2]);
        }
        if (m11 > m22) {
            const num6 = Math.sqrt(1 + m11 - m00 - m22);
            return new Quaternion([(m10 + m01) * 0, 5 / num6, 0.5 * num6, (m21 + m12) * 0.5 / num6, (m20 - m02) * 0.5 / num6]);
        }
        const num5 = Math.sqrt(1 + m22 - m00 - m11);
        return new Quaternion([(m20 + m02) * 0.5 / num5, (m21 + m12) * 0.5 / num5, 0.5 * num5, (m01 - m10) * 0.5 / num5]);
    }
    static get Identity() {
        return new Quaternion(quat.create());
    }
    get eularAngles() {
        const eular = this.factoringQuaternionZXY();
        return new Vector3(eular.x, eular.y, eular.z);
    }
    set eularAngles(v) {
        this.rawElements = Quaternion.euler(v.X, v.Y, v.Z).rawElements;
    }
    /**
    * Getter for X.
    */
    get X() {
        return this.rawElements[0];
    }
    /**
    * Getter for Y.
    */
    get Y() {
        return this.rawElements[1];
    }
    /**
    * Getter for Z.
    */
    get Z() {
        return this.rawElements[2];
    }
    /**
    * Getter for W.
    */
    get W() {
        return this.rawElements[3];
    }
    /**
    * Getter for imaginary part vector.
    * It returns the vector (x,y,z)
    */
    get ImaginaryPart() {
        return new Vector3(this.X, this.Y, this.Z);
    }
    /**
    * Get the conjugate of this quaternion
    */
    get Conjugate() {
        const newQuat = quat.create();
        return new Quaternion(quat.conjugate(newQuat, this.rawElements));
    }
    /**
    * Get the length
    */
    get Length() {
        return quat.len(this.rawElements);
    }
    equalWith(q) {
        return Quaternion.equals(this, q);
    }
    /**
    * Get normalized quaternion
    */
    normalize() {
        const newQuat = quat.create();
        return new Quaternion(quat.normalize(newQuat, this.rawElements));
    }
    inverse() {
        const newQuat = quat.create();
        return new Quaternion(quat.invert(newQuat, this.rawElements));
    }
    toAngleAxisString() {
        const angle = 2 * Math.acos(this.W);
        const imm = Math.sqrt(1 - this.W * this.W);
        if (angle !== 180 && angle !== 0) {
            return `axis(${ angle },${ this.X / imm },${ this.Y / imm },${ this.Z / imm })`;
        } else if (angle === 0) {
            return `axis(${ angle },0,1,0)`;
        } else {
            return `axis(180d,${ this.X },${ this.Y },${ this.Z })`;
        }
    }
    toString() {
        return this.toAngleAxisString();
    }
    factoringQuaternionZXY() {
        const result = { x: 0, y: 0, z: 0 };
        const mat = Matrix.rotationQuaternion(this);
        const sx = mat.rawElements[6];
        if (Math.abs(sx) < 1 - 1.0E-4) {
            result.x = Math.asin(sx);
            result.z = Math.atan2(-mat.rawElements[4], mat.rawElements[5]);
            result.y = Math.atan2(-mat.rawElements[2], mat.rawElements[10]);
        } else {
            result.y = 0;
            result.x = Math.PI / 2 * sx;
            result.z = Math.atan2(mat.rawElements[1], mat.rawElements[0]);
        }
        return result;
    }
    factoringQuaternionXYZ() {
        const result = { x: 0, y: 0, z: 0 };
        const mat = Matrix.rotationQuaternion(this);
        const sy = -mat.rawElements[2];
        if (Math.abs(sy) < 1 - 1.0E-4) {
            result.x = Math.atan2(mat.rawElements[6], mat.rawElements[10]);
            result.y = Math.asin(sy);
            result.z = Math.atan2(mat.rawElements[1], mat.rawElements[0]);
        } else {
            result.x = 0;
            result.y = Math.PI / 2 * sy;
            result.z = Math.atan2(-mat.rawElements[4], mat.rawElements[5]);
        }
        return result;
    }
}

class Rectangle {
    constructor(left, top, width, height) {
        this._left = left;
        this._top = top;
        this._width = width;
        this._height = height;
    }
    static equals(r1, r2) {
        return r1.Left === r2.Left && r1.Right === r2.Right && r1.Top === r2.Top && r1.Bottom === r2.Bottom;
    }
    static edgeSizeEquals(r1, r2) {
        return r1.Width === r2.Width && r1.Height === r2.Height;
    }
    get Left() {
        return this._left;
    }
    get Right() {
        return this.Left + this.Width;
    }
    get Top() {
        return this._top;
    }
    get Bottom() {
        return this._top + this._height;
    }
    get Width() {
        return this._width;
    }
    get Height() {
        return this._height;
    }
    contains(xOrPoint, y) {
        let x;
        if (xOrPoint instanceof Vector2) {
            x = xOrPoint.X;
            y = xOrPoint.Y;
        } else {
            x = xOrPoint;
        }
        return this.Left <= x && this.Right >= x && this.Top <= y && this.Bottom >= y;
    }
    toLocal(xOrPoint, y) {
        let x;
        if (xOrPoint instanceof Vector2) {
            x = xOrPoint.X;
            y = xOrPoint.Y;
        } else {
            x = xOrPoint;
        }
        x -= this.Left;
        y -= this.Top;
        return xOrPoint instanceof Vector2 ? new Vector2(x, y) : [x, y];
    }
    toString() {
        return `Rectangle(${ this.Left },${ this.Top }-${ this.Right },${ this.Bottom })`;
    }
}

///<reference path="../lib-ts/gl-matrix.d.ts"/>

class GeometryUtility {
    /**
     * Generateor wrap for array
     * @param  {number[]}                 array [description]
     * @return {IterableIterator<number>}       [description]
     */
    static *fromArray(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }
    /**
     * Convert triangles topology to lines. Basically uses for making wireframes.
     * @param  {IterableIterator<number>} indicies [description]
     * @return {IterableIterator<number>}          [description]
     */
    static *linesFromTriangles(indicies) {
        const ic = new Array(3);
        let i = 0;
        for (let index of indicies) {
            ic[i % 3] = index;
            if (i % 3 === 2) {
                const a = ic[0],
                      b = ic[1],
                      c = ic[2];
                yield* [a, b, b, c, c, a];
            }
            i++;
        }
    }
    /**
     * Generator for ellipse positions
     * @param  {Vector3}                  center [the center position of ellipse]
     * @param  {Vector3}                  up     [up vector for ellipse]
     * @param  {Vector3}                  right  [right vector for ellipse]
     * @param  {number}                   divide [how many triangles should consists in the ellipse]
     * @return {IterableIterator<number>}        [Generated iterator for position]
     */
    static *ellipsePosition(center, up, right, divide) {
        yield center.X;
        yield center.Y;
        yield center.Z;
        const step = 2 * Math.PI / divide;
        for (let i = 0; i < divide; i++) {
            const theta = step * i;
            const sin = Math.sin(Math.PI * 2 - theta);
            const cos = Math.cos(Math.PI * 2 - theta);
            yield center.X + cos * up.X + sin * right.X;
            yield center.Y + cos * up.Y + sin * right.Y;
            yield center.Z + cos * up.Z + sin * right.Z;
        }
    }
    static *trianglePosition(center, up, right) {
        let p0 = center.addWith(up);
        let p1 = center.subtractWith(up).addWith(right);
        let p2 = center.subtractWith(up).subtractWith(right);
        yield* p0.rawElements;
        yield* p1.rawElements;
        yield* p2.rawElements;
    }
    static *cubePosition(center, up, right, forward) {
        yield* GeometryUtility.quadPosition(center.subtractWith(forward), up, right); // 手前
        yield* GeometryUtility.quadPosition(center.addWith(forward), up, right.negateThis()); // 奥
        yield* GeometryUtility.quadPosition(center.addWith(up), forward, right); // 上
        yield* GeometryUtility.quadPosition(center.addWith(right), forward, up.negateThis()); // 右
        yield* GeometryUtility.quadPosition(center.subtractWith(up), forward, right.negateThis()); // 下
        yield* GeometryUtility.quadPosition(center.subtractWith(right), forward, up); // 左
    }
    static *quadPosition(center, up, right) {
        let p0 = center.subtractWith(right).addWith(up);
        let p1 = center.addWith(right).addWith(up);
        let p2 = center.addWith(right).subtractWith(up);
        let p3 = center.subtractWith(right).subtractWith(up);
        yield* p0.rawElements;
        yield* p1.rawElements;
        yield* p2.rawElements;
        yield* p3.rawElements;
    }
    static *planePosition(center, up, right, divide) {
        for (let i = 0; i < divide; i++) {
            for (let j = 0; j < divide; j++) {
                const vec = center.addWith(Vector3.multiply(divide / 4 - j * 2 / divide, up)).addWith(Vector3.multiply(divide / 4 - i * 2 / divide, right));
                yield* GeometryUtility.quadPosition(vec, Vector3.multiply(1 / divide, up), Vector3.multiply(1 / divide, right));
                yield* GeometryUtility.quadPosition(vec, Vector3.multiply(1 / divide, up), Vector3.multiply(1 / divide, right.negateThis()));
            }
        }
    }
    static *cylinderPosition(center, up, right, forward, divide) {
        yield* GeometryUtility.ellipsePosition(center.addWith(up), forward, right, divide);
        yield* GeometryUtility.ellipsePosition(center.subtractWith(up), forward, Vector3.negate(right), divide);
        const step = 2 * Math.PI / divide;
        const d = Math.cos(step / 2);
        const d2 = Math.sin(step / 2);
        const temp = divide % 2 == 0 ? step / 2 : 0;
        for (let i = 0; i < divide; i++) {
            const theta = step / 2 + step * i;
            const sin = Math.sin((Math.PI - step) / 2 - theta);
            const cos = Math.cos((Math.PI - step) / 2 - theta);
            const currentCenter = new Vector3(d * cos, center.Y, d * sin);
            const currentRight = new Vector3(Math.cos(-step / 2 - theta), center.Y, Math.sin(-step / 2 - theta));
            yield* GeometryUtility.quadPosition(currentCenter, up, Vector3.multiply(d2, currentRight));
        }
    }
    static *conePosition(center, up, right, forward, divide) {
        yield* GeometryUtility.ellipsePosition(center.subtractWith(up), forward, Vector3.negate(right), divide);
        const step = 2 * Math.PI / divide;
        const d = Math.cos(step / 2) / 2;
        const d2 = Math.sin(step / 2);
        for (let i = 0; i < divide; i++) {
            const theta = step * i;
            const sin = Math.sin((Math.PI - step) / 2 - theta);
            const cos = Math.cos((Math.PI - step) / 2 - theta);
            const currentCenter = new Vector3(d * cos, center.Y, d * sin);
            const currentRight = new Vector3(Math.cos(-step / 2 - theta), center.Y, Math.sin(-step / 2 - theta));
            yield* GeometryUtility.trianglePosition(currentCenter, up.subtractWith(currentCenter), Vector3.multiply(d2, currentRight));
        }
    }
    static *spherePosition(center, up, right, forward, rowDiv, circleDiv) {
        yield* center.addWith(up).rawElements;
        yield* center.subtractWith(up).rawElements;
        const ia = 2 * Math.PI / circleDiv;
        const ja = Math.PI / (rowDiv + 1);
        for (let j = 1; j <= rowDiv; j++) {
            const phi = ja * j;
            const sinPhi = Math.sin(phi);
            const upVector = up.multiplyWith(Math.cos(phi));
            for (let i = 0; i <= circleDiv; i++) {
                const theta = ia * i;
                yield* right.multiplyWith(Math.cos(theta)).addWith(forward.multiplyWith(Math.sin(theta))).multiplyWith(sinPhi).addWith(upVector).rawElements;
            }
        }
    }
    static *quadNormal(normal) {
        yield* normal.rawElements;
        yield* normal.rawElements;
        yield* normal.rawElements;
        yield* normal.rawElements;
    }
    static *ellipseNormal(normal, divide) {
        for (let i = 0; i < divide + 1; i++) {
            yield* normal.rawElements;
        }
    }
    static *triangleNormal(normal) {
        yield* normal.rawElements;
        yield* normal.rawElements;
        yield* normal.rawElements;
    }
    static *cubeNormal(center, up, right, forward) {
        yield* GeometryUtility.quadNormal(forward.negateThis());
        yield* GeometryUtility.quadNormal(forward);
        yield* GeometryUtility.quadNormal(up);
        yield* GeometryUtility.quadNormal(right);
        yield* GeometryUtility.quadNormal(up.negateThis());
        yield* GeometryUtility.quadNormal(right.negateThis());
    }
    static *cylinderNormal(center, up, right, forward, divide) {
        yield* GeometryUtility.ellipseNormal(up, divide);
        yield* GeometryUtility.ellipseNormal(up.negateThis(), divide);
        const step = 2 * Math.PI / divide;
        let lastRight = new Vector3(Math.cos(-step / 2), center.Y, Math.sin(-step / 2));
        for (let i = 0; i < divide; i++) {
            const theta = step * (i + 1);
            const sin = Math.sin(Math.PI / 2 - theta);
            const cos = Math.cos(Math.PI / 2 - theta);
            const currentRight = new Vector3(Math.cos(-step / 2 - theta), center.Y, Math.sin(-step / 2 - theta));
            yield* Vector3.cross(lastRight, up).rawElements;
            yield* Vector3.cross(currentRight, up).rawElements;
            yield* Vector3.cross(currentRight, up).rawElements;
            yield* Vector3.cross(lastRight, up).rawElements;
            lastRight = currentRight;
        }
    }
    static *coneNormal(center, up, right, forward, divide) {
        yield* GeometryUtility.ellipseNormal(up.negateThis(), divide);
        const step = 2 * Math.PI / divide;
        const d = Math.cos(step / 2) / 2;
        for (let i = 0; i < divide; i++) {
            const theta = step * i;
            const sin = Math.sin((Math.PI - step) / 2 - theta);
            const cos = Math.cos((Math.PI - step) / 2 - theta);
            const currentCenter = new Vector3(d * cos, center.Y, d * sin);
            const currentRight = new Vector3(Math.cos(-step / 2 - theta), center.Y, Math.sin(-step / 2 - theta));
            yield* GeometryUtility.triangleNormal(Vector3.cross(currentRight, up.subtractWith(currentCenter)));
        }
    }
    static *planeNormal(normal, divide) {
        for (let i = 0; i < divide; i++) {
            for (let j = 0; j < divide; j++) {
                yield* GeometryUtility.quadNormal(normal);
                yield* GeometryUtility.quadNormal(normal.negateThis());
            }
        }
    }
    static *sphereNormal(up, right, forward, rowDiv, circleDiv) {
        yield* GeometryUtility.spherePosition(Vector3.Zero, up, right, forward, rowDiv, circleDiv);
    }
    static *sphereUV(rowDiv, circleDiv) {
        yield* [0, 0, 0, 1];
        const ia = 2 * Math.PI / circleDiv;
        const ja = Math.PI / (rowDiv + 1);
        for (let j = 1; j <= rowDiv; j++) {
            const phi = ja * j;
            const sinPhi = Math.sin(phi);
            for (let i = 0; i <= circleDiv; i++) {
                const theta = ia * i;
                yield* [theta / Math.PI / 2, phi / Math.PI];
            }
        }
    }
    static *quadUV() {
        yield* [0, 0];
        yield* [1, 0];
        yield* [1, 1];
        yield* [0, 1];
    }
    static *cubeUV() {
        for (let i = 0; i < 6; i++) {
            yield* GeometryUtility.quadUV();
        }
    }
    static *triangleUV() {
        yield* [0, 0];
        yield* [1, 0];
        yield* [0, 1];
    }
    static *ellipseUV(divide) {
        yield* [0.5, 0.5];
        const step = 2 * Math.PI / divide;
        for (let i = 0; i < divide; i++) {
            const theta = step * i;
            yield* [0.5 + Math.cos(theta + Math.PI) / 2, 0.5 + Math.sin(theta + Math.PI) / 2];
        }
    }
    static *planeUV(divide) {
        const p = 1 / divide;
        for (let i = 0; i < divide; i++) {
            for (let j = 0; j < divide; j++) {
                yield* GeometryUtility.quadUV();
                yield* GeometryUtility.quadUV();
            }
        }
    }
    static *cylinderUV(divide) {
        yield* GeometryUtility.ellipseUV(divide);
        yield* GeometryUtility.ellipseUV(divide);
        const p = 1 / divide;
        for (let i = 0; i < divide; i++) {
            yield* GeometryUtility.quadUV();
            for (let j = 0; j < divide; j++) {
                yield* [p * j, 0];
                yield* [p * (j + 1), 0];
                yield* [p * (j + 1), 1];
                yield* [p * j, 1];
            }
        }
    }
    static *coneUV(divide) {
        yield* GeometryUtility.ellipseUV(divide);
        const step = Math.PI / 2 / divide;
        for (let i = 0; i < divide; i++) {
            const theta = step * i;
            yield* [0, 0];
            yield* [Math.cos(theta), Math.sin(theta)];
            yield* [Math.cos(theta + step), Math.sin(theta + step)];
        }
    }
    static *triangleIndex(offset) {
        const o = offset;
        yield* [o, o + 2, o + 1];
    }
    static *quadIndex(offset) {
        const o = offset;
        yield* [o, o + 2, o + 1, o, o + 3, o + 2];
    }
    static *cubeIndex(offset) {
        const s = GeometryUtility.quadSize();
        for (let i = 0; i < 6; i++) {
            yield* GeometryUtility.quadIndex(offset + s * i);
        }
    }
    static *sphereIndex(offset, rowDiv, circleDiv) {
        const getIndex = (i, j) => offset + (circleDiv + 1) * j + 2 + i;
        const top = offset;
        const bottom = offset + 1;
        // upper side
        for (let i = 0; i < circleDiv; i++) {
            yield top;
            yield getIndex(i, 0);
            yield getIndex(i + 1, 0);
        }
        // middle
        for (let j = 0; j < rowDiv - 1; j++) {
            for (let i = 0; i < circleDiv; i++) {
                yield getIndex(i, j);
                yield getIndex(i, j + 1);
                yield getIndex(i + 1, j);
                yield getIndex(i, j + 1);
                yield getIndex(i + 1, j + 1);
                yield getIndex(i + 1, j);
            }
        }
        // lower side
        for (let i = 0; i < circleDiv; i++) {
            yield bottom;
            yield getIndex(i + 1, rowDiv - 1);
            yield getIndex(i, rowDiv - 1);
        }
    }
    static *cylinderIndex(offset, divide) {
        const s = GeometryUtility.ellipseSize(divide);
        const t = GeometryUtility.quadSize();
        yield* GeometryUtility.ellipseIndex(offset, divide);
        yield* GeometryUtility.ellipseIndex(offset + s, divide);
        for (let i = 0; i < divide; i++) {
            yield* GeometryUtility.quadIndex(offset + s * 2 + t * i);
        }
    }
    static *coneIndex(offset, divide) {
        const s = GeometryUtility.ellipseSize(divide);
        const t = GeometryUtility.triangleSize();
        yield* GeometryUtility.ellipseIndex(offset, divide);
        for (let i = 0; i < divide; i++) {
            yield* GeometryUtility.triangleIndex(offset + s + i * t);
        }
    }
    static *planeIndex(offset, divide) {
        const s = GeometryUtility.quadSize();
        for (let i = 0; i < 2 * divide * divide; i++) {
            yield* GeometryUtility.quadIndex(offset + s * i);
        }
    }
    static *ellipseIndex(offset, divide) {
        for (let i = 0; i < divide - 1; i++) {
            yield* [offset, offset + 1 + i, offset + 2 + i];
        }
        yield* [offset, offset + divide, offset + 1];
    }
    static quadSize() {
        return 4;
    }
    static triangleSize() {
        return 3;
    }
    static cubeSize() {
        return 6 * GeometryUtility.quadSize();
    }
    static sphereSize(rowDiv, circleDiv) {
        return 2 + rowDiv * (circleDiv + 1);
    }
    static cylinderSize(divide) {
        return GeometryUtility.ellipseSize(divide) * 2 + divide * GeometryUtility.quadSize();
    }
    static coneSize(divide) {
        return GeometryUtility.ellipseSize(divide) + divide * GeometryUtility.triangleSize();
    }
    static planeSize(divide) {
        return 2 * divide * divide * GeometryUtility.quadSize();
    }
    static ellipseSize(divide) {
        return divide + 1;
    }
}

/**
 * Provides the feature to instanciate primitive geometry.
 */
class GeometryFactory {
    constructor(gl) {
        this.gl = gl;
    }
    /**
     * Add new type geometry
     * @param {string}                   typeName        [description]
     * @param {IAttributeDeclaration }}             argumentDeclarations [description]
     * @param {IGeometryFactoryDelegate} factoryDelegate [description]
     */
    static addType(typeName, argumentDeclarations, factoryDelegate) {
        GeometryFactory.factoryDelegates[typeName] = factoryDelegate;
        GeometryFactory.factoryArgumentDeclarations[typeName] = argumentDeclarations;
    }
    instanciate(type, args) {
        const factoryDelegate = GeometryFactory.factoryDelegates[type];
        if (!factoryDelegate) {
            throw new Error(`Can not instanciate unknown geometry type ${ type }`);
        }
        return factoryDelegate(this.gl, args);
    }
    instanciateAsDefault(type) {
        const decl = GeometryFactory.factoryArgumentDeclarations[type];
        const args = {};
        for (let attr in decl) {
            const attrDecl = decl[attr];
            args[attr] = attrDecl.defaultValue;
        }
        return this.instanciate(type, args);
    }
}
/**
 * Delegates to be used as factory
 */
GeometryFactory.factoryDelegates = {};
/**
 * Argument inputs to be used for construction of geometry.
 */
GeometryFactory.factoryArgumentDeclarations = {};

class ResourceBase extends IDObject {
    constructor(gl) {
        super();
        this.gl = gl;
        this.destroyed = false;
        this.valid = false;
    }
    get valid() {
        return this._valid;
    }
    set valid(val) {
        if (this._valid === val) {
            return;
        }
        this._valid = val;
        if (this._valid) {
            this._validResolve(this);
        } else {
            this.validPromise = new Promise(resolve => {
                this._validResolve = resolve;
            });
        }
    }
    destroy() {
        this.destroyed = true;
    }
}

class Buffer extends ResourceBase {
    constructor(gl, target, usage) {
        super(gl);
        this.target = target;
        this.usage = usage;
        this.buffer = gl.createBuffer();
    }
    update(length, subBuffer) {
        this.bind();
        if (subBuffer) {
            if (!this.valid) {
                this.gl.bufferData(this.target, length + subBuffer.byteLength, this.usage);
            }
            this.gl.bufferSubData(this.target, length, subBuffer);
        } else {
            if (typeof length === "number") {
                this.gl.bufferData(this.target, length, this.usage);
            } else {
                this.gl.bufferData(this.target, length, this.usage);
            }
        }
        this.valid = true;
    }
    bind() {
        this.gl.bindBuffer(this.target, this.buffer);
    }
    destroy() {
        super.destroy();
        this.gl.deleteBuffer(this.buffer);
    }
}

/**
 * The geometry class for managing buffer resource
 */
class Geometry {
    constructor(verticies, attribInfo, indicies) {
        this.verticies = verticies;
        this.attribInfo = attribInfo;
        this.indicies = indicies;
        this._validateGLContext();
        // check all buffers requested by attribute variables are all contained in verticies
        for (let attrKey in attribInfo) {
            if (typeof verticies[attribInfo[attrKey].bufferName] === "undefined") {
                throw new Error(`The buffer request by ${ attribInfo[attrKey].bufferName } is not contained in geometry.`);
            }
        }
    }
    draw(indexName, attribNames, program, count = Number.MAX_VALUE, offset = 0) {
        const targetIndex = this.indicies[indexName];
        attribNames.forEach(name => {
            const attribInfo = this.attribInfo[name];
            if (!attribInfo) {
                throw new Error("There is no such vertex buffer");
            }
            const index = program.findAttributeLocation(name);
            if (index < 0) {
                return;
            }
            const buffer = this.verticies[attribInfo.bufferName];
            buffer.bind();
            this._gl.vertexAttribPointer(index, attribInfo.size, attribInfo.type, false, attribInfo.stride, attribInfo.offset);
        });
        targetIndex.index.bind();
        this._gl.drawElements(targetIndex.topology, Math.min(targetIndex.count, count), targetIndex.type, Math.min(offset * targetIndex.byteSize, (targetIndex.count - 1) * targetIndex.byteSize));
    }
    _validateGLContext() {
        // Check for index buffers
        for (let indexName in this.indicies) {
            const index = this.indicies[indexName];
            if (!this._gl) {
                this._gl = index.index.gl;
            }
            if (this._gl !== index.index.gl) {
                throw new Error("All index buffers should be initialized with same context");
            }
        }
        // Check for vertex buffers
        for (let vertexName in this.verticies) {
            const vertex = this.verticies[vertexName];
            if (this._gl !== vertex.gl) {
                throw new Error("All vertex buffers should be initialized with same context");
            }
        }
    }
}

/**
 * Helper class to instanciate Geometry easily.
 */
class GeometryBuilder {
    static build(gl, info) {
        const buffers = {};
        const attribs = {};
        for (let bufferKey in info.verticies) {
            const byteWidth = 4;
            const buffer = info.verticies[bufferKey];
            let sizeSum = 0;
            for (let attribKey in buffer.size) {
                if (attribs[attribKey]) {
                    throw new Error("Attribute variable name was dupelicated");
                }
                const size = buffer.size[attribKey];
                attribs[attribKey] = {
                    size: size,
                    offset: sizeSum * byteWidth,
                    bufferName: bufferKey,
                    type: buffer.type ? buffer.type : WebGLRenderingContext.FLOAT,
                    stride: 0
                };
                sizeSum += size;
            }
            for (let attribKey in buffer.size) {
                attribs[attribKey].stride = sizeSum * byteWidth;
            }
            // generate source array of vertex buffer
            const bufferSource = new Array(sizeSum * buffer.count);
            const bufferGenerator = buffer.getGenerators();
            const generators = [];
            const sizes = [];
            const beforeEach = bufferGenerator.beforeEach ? bufferGenerator.beforeEach() : undefined;
            for (let attribKey in buffer.size) {
                if (attribKey === "beforeEach") {
                    continue;
                }
                const generator = bufferGenerator[attribKey];
                generators.push(generator());
                sizes.push(buffer.size[attribKey]);
            }
            let i = 0;
            for (let vertCount = 0; vertCount < buffer.count; vertCount++) {
                if (beforeEach && beforeEach.next().done) {
                    throw new Error("before each was ended before reaching count.");
                }
                for (let genIndex = 0; genIndex < generators.length; genIndex++) {
                    const generator = generators[genIndex];
                    for (let sizeIndex = 0; sizeIndex < sizes[genIndex]; sizeIndex++) {
                        const genResult = generator.next();
                        if (genResult.done) {
                            throw new Error("Generator function finished before reaching specified count");
                        }
                        bufferSource[i] = genResult.value;
                        i++;
                    }
                }
            }
            // instanciate buffers
            buffers[bufferKey] = new Buffer(gl, WebGLRenderingContext.ARRAY_BUFFER, buffer.usage ? buffer.usage : WebGLRenderingContext.STATIC_DRAW);
            buffers[bufferKey].update(new Float32Array(bufferSource));
        }
        return new Geometry(buffers, attribs, this._generateIndicies(gl, info.indicies));
    }
    static _generateIndicies(gl, indexGenerator) {
        const indexMap = {};
        for (let indexName in indexGenerator) {
            const indicies = [];
            const generatorInfo = indexGenerator[indexName];
            for (let variable of generatorInfo.generator()) {
                indicies.push(variable);
            }
            const bufferType = this._getIndexType(indicies.length);
            const buffer = new Buffer(gl, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
            buffer.update(new bufferType.ctor(indicies));
            indexMap[indexName] = {
                count: indicies.length,
                index: buffer,
                type: bufferType.format,
                byteSize: bufferType.byteSize,
                topology: generatorInfo.topology ? generatorInfo.topology : WebGLRenderingContext.TRIANGLES
            };
        }
        return indexMap;
    }
    /**
     * Determine which index type should be used
     * @param  {number} length [description]
     * @return {[type]}        [description]
     */
    static _getIndexType(length) {
        let format = WebGLRenderingContext.UNSIGNED_INT;
        let arrayConstructor = Uint32Array;
        let byteSize = 4;
        if (length < 256) {
            format = WebGLRenderingContext.UNSIGNED_BYTE;
            arrayConstructor = Uint8Array;
            byteSize = 1;
        } else if (length < 65535) {
            format = WebGLRenderingContext.UNSIGNED_SHORT;
            arrayConstructor = Uint16Array;
            byteSize = 2;
        } else if (length >= 4294967296) {
            throw new Error("Too many index of geometry!");
        }
        return {
            format: format,
            ctor: arrayConstructor,
            byteSize: byteSize
        };
    }
}

// TODO add normal and uvs
// TODO apply attributes
class DefaultPrimitives {
    static register() {
        DefaultPrimitives._registerTriangle();
        DefaultPrimitives._registerQuad();
        DefaultPrimitives._registerCube();
        DefaultPrimitives._registerSphere();
        DefaultPrimitives._registerCircle();
        DefaultPrimitives._registerCylinder();
        DefaultPrimitives._registerCone();
        DefaultPrimitives._registerPlane();
    }
    static _registerTriangle() {
        GeometryFactory.addType("triangle", {}, (gl, attrs) => {
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.triangleIndex(0);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.triangleIndex(0));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.triangleSize(),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.trianglePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.triangleNormal(Vector3.ZUnit);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.triangleUV();
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerQuad() {
        GeometryFactory.addType("quad", {}, (gl, attrs) => {
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.quadIndex(0);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.quadIndex(0));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.quadSize(),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.quadPosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.quadNormal(Vector3.ZUnit);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.quadUV();
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerCube() {
        GeometryFactory.addType("cube", {}, (gl, attrs) => {
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.cubeIndex(0);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.cubeIndex(0));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.cubeSize(),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.cubePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis());
                                },
                                normal: function* () {
                                    yield* GeometryUtility.cubeNormal(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis());
                                },
                                uv: function* () {
                                    yield* GeometryUtility.cubeUV();
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerSphere() {
        GeometryFactory.addType("sphere", {
            divVertical: {
                converter: "Number",
                defaultValue: 10
            },
            divHorizontal: {
                converter: "Number",
                defaultValue: 10
            }
        }, (gl, attrs) => {
            const dH = attrs["divHorizontal"];
            const dV = attrs["divVertical"];
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.sphereIndex(0, dH, dV);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.sphereIndex(0, dH, dV));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.sphereSize(dH, dV),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.spherePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), dH, dV);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.sphereNormal(Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), dH, dV);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.sphereUV(dH, dV);
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerCircle() {
        GeometryFactory.addType("circle", {
            divide: {
                converter: "Number",
                defaultValue: 50
            }
        }, (gl, attrs) => {
            const div = attrs["divide"];
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.ellipseIndex(0, div);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.ellipseIndex(0, div));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.ellipseSize(div),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.ellipsePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, div);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.ellipseNormal(Vector3.ZUnit, div);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.ellipseUV(div);
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerCylinder() {
        GeometryFactory.addType("cylinder", {
            divide: {
                converter: "Number",
                defaultValue: 50
            }
        }, (gl, attrs) => {
            const div = attrs["divide"];
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.cylinderIndex(0, div);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.cylinderIndex(0, div));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.cylinderSize(div),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.cylinderPosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), div);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.cylinderNormal(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), div);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.cylinderUV(div);
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerCone() {
        GeometryFactory.addType("cone", {
            divide: {
                converter: "Number",
                defaultValue: 50
            }
        }, (gl, attrs) => {
            const div = attrs["divide"];
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.coneIndex(0, div);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.coneIndex(0, div));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.coneSize(div),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.conePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), div);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.coneNormal(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, Vector3.ZUnit.negateThis(), div);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.coneUV(div);
                                }
                            };
                        }
                    }
                }
            });
        });
    }
    static _registerPlane() {
        GeometryFactory.addType("plane", {
            divide: {
                converter: "Number",
                defaultValue: 10
            }
        }, (gl, attrs) => {
            const div = attrs["divide"];
            return GeometryBuilder.build(gl, {
                indicies: {
                    default: {
                        generator: function* () {
                            yield* GeometryUtility.planeIndex(0, div);
                        },
                        topology: WebGLRenderingContext.TRIANGLES
                    },
                    wireframe: {
                        generator: function* () {
                            yield* GeometryUtility.linesFromTriangles(GeometryUtility.planeIndex(0, div));
                        },
                        topology: WebGLRenderingContext.LINES
                    }
                },
                verticies: {
                    main: {
                        size: {
                            position: 3,
                            normal: 3,
                            uv: 2
                        },
                        count: GeometryUtility.planeSize(div),
                        getGenerators: () => {
                            return {
                                position: function* () {
                                    yield* GeometryUtility.planePosition(Vector3.Zero, Vector3.YUnit, Vector3.XUnit, div);
                                },
                                normal: function* () {
                                    yield* GeometryUtility.planeNormal(Vector3.ZUnit, div);
                                },
                                uv: function* () {
                                    yield* GeometryUtility.planeUV(div);
                                }
                            };
                        }
                    }
                }
            });
        });
    }
}

/**
 * Provides managing all promise on initializing resources.
 */
class AssetLoader extends EEObject {
    constructor() {
        super(...arguments);
        /**
         * Promise count registered.
         * @type {number}
         */
        this.registerCount = 0;
        /**
         * Promise count finished successfully.
         * @type {number}
         */
        this.loadCount = 0;
        /**
         * Promise count completed(success and errored)
         * @type {number}
         */
        this.completeCount = 0;
        /**
         * Promise count errored
         * @type {number}
         */
        this.errorCount = 0;
        /**
         * Main promise to provide tasks for waiting for all resource loading.
         * @type {Promise<void>}
         */
        this.promise = new Promise(resolve => {
            this._resolve = resolve;
        });
    }
    /**
     * Register an promise to be waited until finished.
     */
    register(promise) {
        this.registerCount++;
        return new Promise((resolve, reject) => {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        resolve((yield promise));
                        this.loadCount++;
                    } catch (e) {
                        reject(e);
                        this.errorCount++;
                    }
                    this.completeCount++;
                    this._checkLoadCompleted();
                });
            }).bind(this)();
        });
    }
    /**
     * Verify all promises are completed.
     */
    _checkLoadCompleted() {
        this.emit("progress", this);
        if (this.registerCount === this.completeCount) {
            this._resolve();
        }
    }
}

var DefaultLoaderChunk = "<div style=\"width:100%;height:100%;position: relative;\">\n    <div style=\"width: 55px;height: 55px;border-radius: 100%;border: 5px solid #381794;border-right-color: #FC659D;animation: rotate 1s linear infinite;position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;\"></div>\n</div>\n<style type=\"text/css\">\n    @keyframes rotate {\n        from {\n            transform: rotate(0deg);\n        }\n        to {\n            transform: rotate(360deg);\n        }\n    }\n</style>\n";

class AssetLoadingManagerComponent extends Component {
    constructor() {
        super(...arguments);
        this.loader = new AssetLoader();
    }
    $treeInitialized() {
        if (this.attributes.get("autoStart").Value) {
            this._autoStart();
        }
        this._documentResolver();
    }
    $awake() {
        this.companion.set(obtainGomlInterface.ns(this.name.ns)("loader"), this.loader);
        this.loader.register(new Promise(resolve => {
            this._documentResolver = resolve;
        }));
        const canvas = this.companion.get("canvasElement");
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        const canvasContainer = document.createElement("div");
        canvasContainer.style.width = canvas.width + "px";
        canvasContainer.style.height = canvas.height + "px";
        canvasContainer.style.position = "relative";
        const loaderContainer = document.createElement("div");
        loaderContainer.innerHTML = DefaultLoaderChunk;
        loaderContainer.style.width = loaderContainer.style.height = "100%";
        canvasContainer.appendChild(loaderContainer);
        canvas.parentElement.replaceChild(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        this._loaderElement = loaderContainer;
    }
    _autoStart() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.promise;
            this._loaderElement.remove();
            this.tree("goml").attr("loopEnabled", true);
        });
    }
}
AssetLoadingManagerComponent.attributes = {
    loadingProgress: {
        defaultValue: 0,
        converter: "Number"
    },
    autoStart: {
        defaultValue: true,
        converter: "Boolean"
    }
};

/**
 * Provides perspective camera as implementation of ICamera.
 */
class PerspectiveCamera {
    constructor() {
        this._viewMatrix = new Matrix();
        this._projectionMatrix = new Matrix();
        this._invProjectionMatrix = new Matrix();
        this._projectionViewMatrix = new Matrix();
        this._eyeCache = Vector3.Zero;
        this._lookAtCache = Vector3.Zero;
        this._upCache = Vector3.Zero;
    }
    getViewMatrix() {
        return this._viewMatrix;
    }
    getProjectionMatrix() {
        return this._projectionMatrix;
    }
    getInvProjectionMatrix() {
        return this._invProjectionMatrix;
    }
    getProjectionViewMatrix() {
        return this._projectionViewMatrix;
    }
    getFar() {
        return this._far;
    }
    setFar(far) {
        this._far = far;
        this._recalculateProjection();
    }
    getNear() {
        return this._near;
    }
    setNear(near) {
        this._near = near;
        this._recalculateProjection();
    }
    getAspect() {
        return this._aspect;
    }
    setAspect(aspect) {
        this._aspect = aspect;
        this._recalculateProjection();
    }
    getFovy() {
        return this._fovy;
    }
    setFovy(fov) {
        this._fovy = fov;
        this._recalculateProjection();
    }
    updateTransform(transform) {
        vec3.transformMat4(this._eyeCache.rawElements, Vector3.Zero.rawElements, transform.globalTransform.rawElements);
        vec4.transformMat4(this._lookAtCache.rawElements, PerspectiveCamera._frontOrigin.rawElements, transform.globalTransform.rawElements);
        vec3.add(this._lookAtCache.rawElements, this._lookAtCache.rawElements, this._eyeCache.rawElements);
        vec4.transformMat4(this._upCache.rawElements, PerspectiveCamera._upOrigin.rawElements, transform.globalTransform.rawElements);
        mat4.lookAt(this._viewMatrix.rawElements, this._eyeCache.rawElements, this._lookAtCache.rawElements, this._upCache.rawElements);
        mat4.mul(this._projectionViewMatrix.rawElements, this._projectionMatrix.rawElements, this._viewMatrix.rawElements);
    }
    _recalculateProjection() {
        mat4.perspective(this._projectionMatrix.rawElements, this._fovy, this._aspect, this._near, this._far);
        mat4.mul(this._projectionViewMatrix.rawElements, this._projectionMatrix.rawElements, this._viewMatrix.rawElements);
        mat4.invert(this._invProjectionMatrix.rawElements, this._projectionMatrix.rawElements);
    }
}
PerspectiveCamera._frontOrigin = new Vector4(0, 0, -1, 0);
PerspectiveCamera._upOrigin = new Vector4(0, 1, 0, 0);

class SceneComponent extends Component {
    constructor() {
        super(...arguments);
        this.sceneDescription = {};
    }
    /**
     * Notify update scene only when send update message is needed.
     * @param {number} loopIndex [description]
     */
    updateScene(loopIndex) {
        if (this._lastUpdateIndex !== loopIndex) {
            this.node.broadcastMessage("update", this.sceneDescription);
            this._lastUpdateIndex = loopIndex;
        }
    }
}
SceneComponent.attributes = {};

class CameraComponent extends Component {
    /**
    * Find scene tag recursively.
    * @param  {GomlNode}       node [the node to searching currently]
    * @return {SceneComponent}      [the scene component found]
    */
    static _findContainedScene(node) {
        if (node.parent) {
            const scene = node.parent.getComponent("Scene");
            if (scene && scene instanceof SceneComponent) {
                return scene;
            } else {
                return CameraComponent._findContainedScene(node.parent);
            }
        } else {
            return null;
        }
    }
    $awake() {
        this.containedScene = CameraComponent._findContainedScene(this.node);
        const c = this.camera = new PerspectiveCamera();
        this.transform = this.node.getComponent("Transform");
        this.$transformUpdated(this.transform);
        c.setFar(this.attributes.get("far").Value);
        c.setNear(this.attributes.get("near").Value);
        c.setFovy(this.attributes.get("fovy").Value);
        c.setAspect(this.attributes.get("aspect").Value);
    }
    updateContainedScene(loopIndex) {
        if (this.containedScene) {
            this.containedScene.updateScene(loopIndex);
        }
    }
    renderScene(args) {
        if (this.containedScene) {
            args.sceneDescription = this.containedScene.sceneDescription;
            this.containedScene.node.broadcastMessage("render", args);
        }
    }
    $transformUpdated(t) {
        if (this.camera) {
            this.camera.updateTransform(t);
        }
    }
}
CameraComponent.attributes = {
    fovy: {
        defaultValue: 0.3,
        converter: "Number"
    },
    near: {
        defaultValue: 0.01,
        converter: "Number"
    },
    far: {
        defaultValue: 10,
        converter: "Number"
    },
    aspect: {
        defaultValue: 1.6,
        converter: "Number"
    }
};

class GLExtRequestor {
    constructor(gl) {
        this.gl = gl;
        this.extensions = {};
        this._readyExtensions = {};
        this._resolveRequested();
        GLExtRequestor._requestObserver.push(this._resolveExtensionSafely);
    }
    /**
     * Request extension to use.
     * @param {string} str [description]
     */
    static request(extName, isNecessary = false) {
        const index = GLExtRequestor._requestIndexOf(extName);
        if (index > -1 && isNecessary) {
            GLExtRequestor._requestedExtensions[index] = { extensionName: extName, isNecessary: isNecessary };
        } else if (index === -1) {
            GLExtRequestor._requestedExtensions.push({ extensionName: extName, isNecessary: isNecessary });
        }
        GLExtRequestor._requestObserver.forEach(o => o(extName));
    }
    static _requestIndexOf(extName) {
        for (let i = 0; i < GLExtRequestor._requestedExtensions.length; i++) {
            if (GLExtRequestor._requestedExtensions[i].extensionName === extName) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Resolve all extension requested already.
     */
    _resolveRequested() {
        GLExtRequestor._requestedExtensions.forEach(e => {
            this._resolveExtensionSafely(e.extensionName);
        });
    }
    _resolveExtensionSafely(extName) {
        const e = GLExtRequestor._requestedExtensions[GLExtRequestor._requestIndexOf(extName)];
        if (!this._resolveExtension(e.extensionName) && e.isNecessary) {
            throw new Error(`A WebGL extension '${ e.extensionName }' was requested. But that is not supported on this device.`);
        }
    }
    _resolveExtension(name) {
        if (this._readyExtensions[name]) {
            return true;
        }
        let ext;
        if (typeof GLExtRequestor._customExtensionResolvers[name] === "undefined") {
            ext = this.extensions[name] = this.gl.getExtension(name);
        } else {
            ext = this.extensions[name] = GLExtRequestor._customExtensionResolvers[name](this.gl);
        }
        this._readyExtensions[name] = this.extensions[name] !== void 0;
        return !!this._readyExtensions[name];
    }
}
/**
 * Extension list requested to use.
 * @type {string[]}
 */
GLExtRequestor._requestedExtensions = [];
/**
 * Some of extensions needed to override resolving extensions by this.
 */
GLExtRequestor._customExtensionResolvers = {};
GLExtRequestor._requestObserver = [];
GLExtRequestor._customExtensionResolvers["WEBGL_color_buffer_float"] = gl => {
    let isSupported;
    if (gl.getExtension("WEBGL_color_buffer_float") === null) {
        const fbo = gl.createFramebuffer();
        const tex = gl.createTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            isSupported = false;
        } else {
            isSupported = true;
        }
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
    } else {
        isSupported = true;
    }
    return isSupported;
};

const ns = obtainGomlInterface.ns("HTTP://GRIMOIRE.GL/NS/DEFAULT");
class CanvasInitializerComponent extends Component {
    $awake() {
        this._scriptTag = this.companion.get("scriptElement");
        if (this._isContainedInBody(this._scriptTag)) {
            // canvas should be placed siblings of the script tag
            this._generateCanvas(this._scriptTag);
        } else {}
        // apply sizes on changed
        this.attributes.get("width").addObserver(v => {
            this.canvas.width = v.Value;
        });
        this.attributes.get("height").addObserver(v => {
            this.canvas.height = v.Value;
        });
    }
    /**
     * Generate canvas element
     * @param  {Element}           parent [description]
     * @return {HTMLCanvasElement}        [description]
     */
    _generateCanvas(scriptTag) {
        const generatedCanvas = document.createElement("canvas");
        generatedCanvas.width = this.attributes.get("width").Value;
        generatedCanvas.height = this.attributes.get("height").Value;
        const gl = this._getContext(generatedCanvas);
        this.companion.set(ns("gl"), gl);
        this.companion.set(ns("canvasElement"), generatedCanvas);
        this.companion.set(ns("GLExtRequestor"), new GLExtRequestor(gl));
        scriptTag.parentElement.insertBefore(generatedCanvas, scriptTag.nextSibling);
        this.canvas = generatedCanvas;
        return generatedCanvas;
    }
    _getContext(canvas) {
        let context = canvas.getContext("webgl");
        if (!context) {
            context = canvas.getContext("webgl-experimental");
        }
        return context;
    }
    /**
     * Check the tag is included in the body
     * @param  {Element} tag [description]
     * @return {boolean}     [description]
     */
    _isContainedInBody(tag) {
        if (!tag.parentElement) {
            return false;
        }
        if (tag.parentNode.nodeName === "BODY") {
            return true;
        }
        return this._isContainedInBody(tag.parentElement);
    }
}
CanvasInitializerComponent.attributes = {
    width: {
        defaultValue: 640,
        converter: "Number"
    },
    height: {
        defaultValue: 480,
        converter: "Number"
    }
};

class GeometryComponent extends Component {
    $mount() {
        const type = this.getValue("type");
        if (type) {
            const gf = this.companion.get("GeometryFactory");
            const attrs = GeometryFactory.factoryArgumentDeclarations[type];
            const geometryArgument = {};
            for (let key in attrs) {
                this.__addAtribute(key, attrs[key]);
                geometryArgument[key] = this.getValue(key);
            }
            this.geometry = gf.instanciate(type, geometryArgument);
            const gr = this.companion.get("GeometryRegistory");
            const name = this.getValue("name");
            if (!name) {
                throw new Error("Name was not specified");
            }
            gr.addGeometry(name, this.geometry);
        }
    }
}
GeometryComponent.attributes = {
    type: {
        converter: "String",
        defaultValue: undefined
    },
    name: {
        converter: "String",
        defaultValue: undefined
    }
};

class GeometryRegistoryComponent extends Component {
    constructor() {
        super(...arguments);
        this._geometries = {};
    }
    $awake() {
        this._factory = new GeometryFactory(this.companion.get("gl"));
        this.companion.set(this.name, this);
        this.companion.set(obtainGomlInterface.ns(this.name.ns)("GeometryFactory"), this._factory);
        for (let geometry of this.getValue("defaultGeometry")) {
            this.addGeometry(geometry, this._factory.instanciateAsDefault(geometry));
        }
    }
    addGeometry(name, geometry) {
        this._geometries[name] = geometry;
    }
    removeGeometry(name) {
        if (this._geometries[name]) {
            delete this._geometries[name];
        }
    }
    getGeometry(name) {
        return this._geometries[name];
    }
}
GeometryRegistoryComponent.attributes = {
    defaultGeometry: {
        converter: "StringArray",
        defaultValue: ["quad", "cube", "sphere"]
    }
};

class LoopManagerComponent extends Component {
    constructor() {
        super(...arguments);
        this._loopActions = [];
        this._loopIndex = 0;
    }
    $awake() {
        this.attributes.get("loopEnabled").addObserver(attr => {
            this._begin();
        });
        this._registerNextLoop = window.requestAnimationFrame // if window.requestAnimationFrame is defined or undefined
        ? () => {
            window.requestAnimationFrame(this._loop.bind(this));
        } : () => {
            window.setTimeout(this._loop.bind(this), 1000 / 60);
        };
    }
    register(action, priorty) {
        this._loopActions.push({
            action: action,
            priorty: priorty
        });
        this._loopActions.sort((a, b) => a.priorty - b.priorty);
    }
    _begin() {
        this._registerNextLoop();
    }
    _loop() {
        this._loopActions.forEach(a => a.action(this._loopIndex));
        this._loopIndex++;
        this._registerNextLoop();
    }
}
LoopManagerComponent.attributes = {
    loopEnabled: {
        defaultValue: false,
        converter: "Boolean"
    }
};

class Pass {
    constructor(program, attributes, beforeDraw) {
        this.program = program;
        this.attributes = attributes;
        this.beforeDraw = beforeDraw;
    }
    draw(arg) {
        this.program.use();
        for (let i = 0; i < this.beforeDraw.length; i++) {
            this.beforeDraw[i](this, arg);
        }
        arg.geometry.draw(arg.targetBuffer, this.attributes, this.program, arg.drawCount, arg.drawOffset);
    }
}

class SORTPass extends Pass {
    constructor(program, attributes, beforeDraw, programInfo) {
        super(program, attributes, beforeDraw);
        this.programInfo = programInfo;
    }
}

class MaterialComponent extends Component {
    constructor() {
        super(...arguments);
        this.materialArgs = {};
    }
    $mount() {
        const typeName = this.getValue("type");
        if (typeName) {
            this.materialPromise = this.companion.get("MaterialFactory").instanciate(typeName);
            this._registerAttributes();
        }
    }
    _registerAttributes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.material = yield this.materialPromise;
            const promises = [];
            this.material.pass.forEach(p => {
                if (p instanceof SORTPass) {
                    for (let key in p.programInfo.gomlAttributes) {
                        this.__addAtribute(key, p.programInfo.gomlAttributes[key]);
                        this.attributes.get(key).addObserver(v => {
                            this.materialArgs[key] = v.Value;
                        });
                        const value = this.materialArgs[key] = this.getValue(key);
                        if (value instanceof ResourceBase) {
                            promises.push(value.validPromise);
                        }
                    }
                }
            });
            yield Promise.all(promises);
            this.ready = true;
        });
    }
}
MaterialComponent.attributes = {
    type: {
        converter: "String",
        defaultValue: undefined
    }
};

class MaterialContainerComponent extends Component {
    constructor() {
        super(...arguments);
        this.materialArgs = {};
        this.ready = false;
    }
    $mount() {
        this.attributes.get("material").addObserver(this._onMaterialChanged);
        this.companion.get("loader").register(this._onMaterialChanged());
    }
    /**
     * When the material attribute is changed.
     */
    _onMaterialChanged() {
        return __awaiter(this, void 0, void 0, function* () {
            const materialPromise = this.getValue("material");
            if (!this._materialComponent) {
                this._prepareInternalMaterial(materialPromise);
            } else {
                this._prepareExternalMaterial(materialPromise);
            }
        });
    }
    /**
     * Resolve materials only when the material required from external material component.
     * @return {Promise<void>} [description]
     */
    _prepareExternalMaterial(materialPromise) {
        return __awaiter(this, void 0, void 0, function* () {
            const loader = this.companion.get("loader");
            loader.register(materialPromise);
            const material = yield materialPromise;
            this.material = material;
            this.materialArgs = this._materialComponent.materialArgs;
            this.ready = true;
        });
    }
    _prepareInternalMaterial(materialPromise) {
        return __awaiter(this, void 0, void 0, function* () {
            // obtain promise of instanciating material
            const loader = this.companion.get("loader");
            loader.register(materialPromise);
            if (!materialPromise) {
                return;
            }
            const material = yield materialPromise;
            const promises = [];
            material.pass.forEach(p => {
                if (p instanceof SORTPass) {
                    for (let key in p.programInfo.gomlAttributes) {
                        const val = p.programInfo.gomlAttributes[key];
                        this.__addAtribute(key, val);
                        this.attributes.get(key).addObserver(v => {
                            this.materialArgs[key] = v.Value;
                        });
                        this.materialArgs[key] = this.getValue(key);
                    }
                }
            });
            yield Promise.all(promises);
            this.material = material;
            this.ready = true;
        });
    }
}
MaterialContainerComponent.attributes = {
    material: {
        converter: "Material",
        defaultValue: undefined,
        componentBoundTo: "_materialComponent" // When the material was specified with the other material tag, this field would be assigned.
    }
};

/**
 * Resolve resources with caching.
 */
class CacheResolver {
    constructor(toAbsolute) {
        this.toAbsolute = toAbsolute;
        this.cache = {};
        this.resolvers = {};
    }
    resolve(src, resolver) {
        return __awaiter(this, void 0, void 0, function* () {
            const abs = this.toAbsolute(src);
            if (this._cached(abs)) {
                return this.cache[abs];
            } else if (this._resolving(abs)) {
                return yield this.resolvers[abs];
            } else {
                this.resolvers[abs] = resolver(abs);
                const result = yield this.resolvers[abs];
                this._resolved(abs, result);
                return result;
            }
        });
    }
    _cached(abs) {
        return typeof this.cache[abs] !== "undefined";
    }
    _resolving(abs) {
        return typeof this.resolvers[abs] !== "undefined";
    }
    _resolved(abs, result) {
        delete this.resolvers[abs];
        this.cache[abs] = result;
    }
}

class SORTPassInfoResolver extends CacheResolver {
    constructor() {
        super(r => r);
    }
}

class UniformProxy {
    constructor(program) {
        this.program = program;
        this._currentTextureRegister = 0;
        this._gl = program.gl;
    }
    uniformBool(variableName, val) {
        this._pass(variableName, l => this._gl.uniform1i(l, val ? 1 : 0));
    }
    uniformMatrix(variableName, mat) {
        this._pass(variableName, l => this._gl.uniformMatrix4fv(l, false, mat.rawElements));
    }
    uniformFloat(variableName, val) {
        this._pass(variableName, l => this._gl.uniform1f(l, val));
    }
    uniformFloatArray(variableName, val) {
        this._pass(variableName, l => this._gl.uniform1fv(l, val));
    }
    uniformInt(variableName, val) {
        this._pass(variableName, l => this._gl.uniform1i(l, val));
    }
    uniformVector2(variableName, val) {
        this._pass(variableName, l => this._gl.uniform2f(l, val.X, val.Y));
    }
    uniformVector2Array(variableName, val) {
        this._pass(variableName, l => this._gl.uniform2fv(l, val));
    }
    uniformVector3(variableName, val) {
        this._pass(variableName, l => this._gl.uniform3f(l, val.X, val.Y, val.Z));
    }
    uniformVector3Array(variableName, val) {
        this._pass(variableName, l => this._gl.uniform3fv(l, val));
    }
    uniformColor3(variableName, val) {
        this._pass(variableName, l => this._gl.uniform3f(l, val.R, val.G, val.B));
    }
    uniformVector4(variableName, val) {
        this._pass(variableName, l => this._gl.uniform4f(l, val.X, val.Y, val.Z, val.W));
    }
    uniformVector4Array(variableName, val) {
        this._pass(variableName, l => this._gl.uniform4fv(l, val));
    }
    uniformColor4(variableName, val) {
        this._pass(variableName, l => this._gl.uniform4f(l, val.R, val.G, val.B, val.A));
    }
    uniformTexture2D(variableName, val) {
        if (val.valid) {
            val.register(this._currentTextureRegister);
            this.uniformInt(variableName, this._currentTextureRegister);
            this._currentTextureRegister++;
        } else {
            console.warn(`The texture assigned to '${ variableName }' is not valid.`);
        }
    }
    onUse() {
        this._currentTextureRegister = 0;
    }
    _pass(variableName, act) {
        const location = this.program.findUniformLocation(variableName);
        if (location) {
            act(location);
        }
    }
}

class Program extends ResourceBase {
    constructor(gl) {
        super(gl);
        this._uniformLocations = {};
        this._attributeLocations = {};
        this.uniforms = new UniformProxy(this);
        this.program = gl.createProgram();
    }
    update(shaders) {
        if (this.valid) {
            // detach all attached shaders previously
            const preciousShaders = this.gl.getAttachedShaders(this.program);
            preciousShaders.forEach(s => this.gl.detachShader(this.program, s));
        }
        shaders.forEach(shader => {
            this.gl.attachShader(this.program, shader.shader);
        });
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, WebGLRenderingContext.LINK_STATUS)) {
            const errorLog = this.gl.getProgramInfoLog(this.program);
            throw new Error(`LINK FAILED\n${ errorLog }`);
        }
        this.valid = true;
    }
    use() {
        this.gl.useProgram(this.program);
        this.uniforms.onUse();
    }
    destroy() {
        super.destroy();
        this.gl.deleteProgram(this.program);
    }
    findAttributeLocation(variableName) {
        if (typeof this._attributeLocations[variableName] === "undefined") {
            this._attributeLocations[variableName] = this.gl.getAttribLocation(this.program, variableName);
            this.gl.enableVertexAttribArray(this._attributeLocations[variableName]);
            return this._attributeLocations[variableName];
        } else {
            return this._attributeLocations[variableName];
        }
    }
    findUniformLocation(variableName) {
        if (typeof this._uniformLocations[variableName] === "undefined") {
            return this._uniformLocations[variableName] = this.gl.getUniformLocation(this.program, variableName);
        } else {
            return this._uniformLocations[variableName];
        }
    }
}

class Shader extends ResourceBase {
    constructor(gl, type, sourceCode) {
        super(gl);
        this.type = type;
        this.sourceCode = sourceCode;
        this.shader = gl.createShader(type);
        if (sourceCode) {
            this.update(sourceCode);
        }
    }
    update(source) {
        this.gl.shaderSource(this.shader, source);
        this.gl.compileShader(this.shader);
        if (!this.gl.getShaderParameter(this.shader, WebGLRenderingContext.COMPILE_STATUS)) {
            throw new Error(`Compiling shader failed.\nSourceCode:\n${ this.sourceCode }\n\nErrorCode:${ this.gl.getShaderInfoLog(this.shader) }`);
        }
        this.valid = true;
    }
    destroy() {
        super.destroy();
        this.gl.deleteShader(this.shader);
    }
}

class GLSLUtil {
    static isPrimitive(type) {
        return GLSLUtil._primitives.indexOf(type) >= 0;
    }
}
GLSLUtil._primitives = ["float", "bool", "int", "vec2", "vec3", "vec4", "ivec2", "ivec3", "ivec4", "bvec2", "bvec3", "bvec4", "mat2", "mat3", "mat4", "sampler1D", "sampler2D", "sampler3D", "samplerCube", "sampler1DShadow", "sampler2DShadow"];

/**
 * Environment uniform value resolver
 */
class EnvUniformValueResolver {
    /**
     * Add static environment uniform value resolver to specified name.
     * @param  {string} name     [description]
     * @param  {string} resolver [description]
     * @return {[type]}          [description]
     */
    static addResolver(name, resolver) {
        EnvUniformValueResolver.resolvers[name] = resolver;
    }
    /**
     * Add dynamic environment uniform value resolver.
     * When pasased variable are not resolved by a resolver, that resolver should return null or undefined.
     * @param  {string} resolver [description]
     * @return {[type]}          [description]
     */
    static addDynamicResolver(resolver) {
        EnvUniformValueResolver.dynamicResolvers.push(resolver);
    }
    static resolve(name, valInfo) {
        if (EnvUniformValueResolver.resolvers[name]) {
            return EnvUniformValueResolver.resolvers[name](valInfo, name);
        } else {
            let targetResolver = null;
            for (let i = 0; i < EnvUniformValueResolver.dynamicResolvers.length; i++) {
                targetResolver = EnvUniformValueResolver.dynamicResolvers[i](valInfo, name);
                if (targetResolver != null) {
                    return targetResolver;
                }
            }
        }
    }
}
/**
 * Static environment uniform value resolvers which names are already known.
 * @type {IVariableInfo}
 */
EnvUniformValueResolver.resolvers = {};
/**
 * Dynamic environment uniform value resolvers which names are not known yet.
 * @type {IVariableInfo}
 */
EnvUniformValueResolver.dynamicResolvers = [];
// Matricies
EnvUniformValueResolver.addResolver("_matPVM", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.transform.calcPVM(args.camera.camera)));
EnvUniformValueResolver.addResolver("_matP", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.camera.camera.getProjectionMatrix()));
EnvUniformValueResolver.addResolver("_matV", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.camera.camera.getViewMatrix()));
EnvUniformValueResolver.addResolver("_matM", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.transform.globalTransform));
EnvUniformValueResolver.addResolver("_matVM", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.transform.calcVM(args.camera.camera)));
EnvUniformValueResolver.addResolver("_matPV", (valInfo, name) => (proxy, args) => proxy.uniformMatrix(name, args.camera.camera.getProjectionViewMatrix()));
// Misc
EnvUniformValueResolver.addResolver("_time", (valInfo, name) => (proxy, args) => proxy.uniformFloat(name, Date.now() % 1000000));
EnvUniformValueResolver.addResolver("_viewportSize", (valInfo, name) => {
    const cacheVec = new Vector2(0, 0);
    return (proxy, args) => {
        cacheVec.X = args.viewport.Width;
        cacheVec.Y = args.viewport.Height;
        proxy.uniformVector2(name, cacheVec);
    };
});
EnvUniformValueResolver.addResolver("_cameraPosition", (valInfo, name) => (proxy, args) => proxy.uniformVector3(name, args.camera.transform.globalPosition));
EnvUniformValueResolver.addResolver("_cameraDirection", (valInfo, name) => (proxy, args) => proxy.uniformVector3(name, args.camera.transform.forward));
EnvUniformValueResolver.addDynamicResolver((valInfo, name) => {
    if (valInfo.variableType === "sampler2D" && valInfo.variableAnnotation["type"] === "backbuffer") {
        return (proxy, mat) => {
            proxy.uniformTexture2D(name, mat.buffers[valInfo.variableAnnotation["name"]]);
        };
    }
});

function _getDecl(converter, defaultValue, register) {
    return {
        converter: converter,
        defaultValue: defaultValue,
        register: register
    };
}
// return default value if annotation containing default value. if not, return provided default value.
function _resolveDefault(vi, defaultValue) {
    if (vi.variableAnnotation.default) {
        return vi.variableAnnotation.default;
    } else {
        return defaultValue;
    }
}
function _registerUserUniforms(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        const attributes = input.info.gomlAttributes;
        for (let variableName in input.info.uniforms) {
            if (variableName.charAt(0) === "_") {
                // this should not assigned by material argument
                continue;
            }
            const valName = variableName;
            const uniforms = input.info.uniforms;
            const variableInfo = uniforms[variableName];
            const annotations = variableInfo.variableAnnotation;
            if (GLSLUtil.isPrimitive(variableInfo.variableType)) {
                if (variableInfo.isArray) {
                    switch (variableInfo.variableType) {
                        case "float":
                            let defaultArray = new Array(variableInfo.arrayLength);
                            defaultArray = defaultArray.map(p => 0);
                            attributes[valName] = _getDecl("NumberArray", _resolveDefault(variableInfo, defaultArray), (proxy, matArg) => {
                                proxy.uniformFloatArray(valName, matArg.attributeValues[valName]);
                            });
                            break;
                        default:
                            throw new Error(`Unsupported array type ${ variableInfo.variableType }`);
                    }
                } else {
                    switch (variableInfo.variableType) {
                        case "bool":
                            attributes[valName] = _getDecl("Boolean", _resolveDefault(variableInfo, false), (proxy, matArg) => {
                                proxy.uniformBool(valName, matArg.attributeValues[valName]);
                            });
                            break;
                        case "float":
                            attributes[valName] = _getDecl("Number", _resolveDefault(variableInfo, 0), (proxy, matArg) => {
                                proxy.uniformFloat(valName, matArg.attributeValues[valName]);
                            });
                            break;
                        case "vec2":
                            attributes[valName] = _getDecl("Vector2", _resolveDefault(variableInfo, "0,0"), (proxy, matArg) => {
                                proxy.uniformVector2(valName, matArg.attributeValues[valName]);
                            });
                            break;
                        case "vec3":
                            if (annotations["type"] === "color") {
                                attributes[valName] = _getDecl("Color3", _resolveDefault(variableInfo, "#000"), (proxy, matArg) => {
                                    proxy.uniformColor3(valName, matArg.attributeValues[valName]);
                                });
                            } else {
                                attributes[valName] = _getDecl("Vector3", _resolveDefault(variableInfo, "0,0,0"), (proxy, matArg) => {
                                    proxy.uniformVector3(valName, matArg.attributeValues[valName]);
                                });
                            }
                            break;
                        case "vec4":
                            if (annotations["type"] === "color") {
                                attributes[valName] = _getDecl("Color4", _resolveDefault(variableInfo, "#0000"), (proxy, matArg) => {
                                    proxy.uniformColor4(valName, matArg.attributeValues[valName]);
                                });
                            } else {
                                attributes[valName] = _getDecl("Vector4", _resolveDefault(variableInfo, "0,0,0,0"), (proxy, matArg) => {
                                    proxy.uniformVector4(valName, matArg.attributeValues[valName]);
                                });
                            }
                            break;
                        case "sampler2D":
                            let flagAssignTo = undefined;
                            // check used flag is existing
                            if (annotations["usedFlag"]) {
                                if (annotations["usedFlag"] !== void 0) {
                                    flagAssignTo = annotations["usedFlag"];
                                }
                            }
                            attributes[valName] = _getDecl("MaterialTexture", _resolveDefault(variableInfo, undefined), (proxy, matArgs) => {
                                if (matArgs.attributeValues[valName]) {
                                    proxy.uniformTexture2D(valName, matArgs.attributeValues[valName](matArgs.buffers));
                                    if (flagAssignTo) {
                                        proxy.uniformBool(flagAssignTo, true);
                                    }
                                } else {
                                    if (flagAssignTo) {
                                        proxy.uniformBool(flagAssignTo, false);
                                    }
                                }
                            });
                            break;
                        default:
                            throw new Error("Unsupported type was found");
                    }
                }
            } else {
                debugger;
            }
        }
        yield Promise.all(promises);
    });
}
/**
 * Register system shader variables whose name starts with _.
 * @param  {ITransformingArgument} input [description]
 * @return {Promise<void>}           [description]
 */
function _registerEnvUniforms(input) {
    const registerers = input.info.systemRegisterers;
    for (let variableName in input.info.uniforms) {
        if (variableName.charAt(0) === "_") {
            const variableInfo = input.info.uniforms[variableName];
            let resolver = EnvUniformValueResolver.resolve(variableName, variableInfo);
            if (resolver) {
                registerers.push(resolver);
                continue;
            }
            throw new Error(`Unknown environment uniform variable ${ variableName }`);
        }
    }
}
var UniformRegisterer = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        yield _registerUserUniforms(input);
        _registerEnvUniforms(input);
        return input;
    });
};

function _removeComment(source) {
    let text = "";
    let isLineComment = false;
    let isMultiLineComment = false;
    for (let i = 0; i < source.length; i++) {
        const c = source.charAt(i);
        if (c === "/") {
            if (i + 1 < source.length) {
                if (source.charAt(i + 1) === "/" && !isMultiLineComment) {
                    isLineComment = true;
                    i++;
                    continue;
                } else if (source.charAt(i + 1) === "*" && !isLineComment) {
                    isMultiLineComment = true;
                    i++;
                    continue;
                }
            }
        }
        if (c === "*" && isMultiLineComment && i + 1 < source.length && source.charAt(i + 1) === "/") {
            isMultiLineComment = false;
            i++;
            continue;
        }
        if (c === "\n" && isLineComment) {
            isLineComment = false;
            continue;
        }
        if (!isLineComment && !isMultiLineComment) {
            text += c;
        }
    }
    return text;
}
var CommentRemover = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.transforming = _removeComment(input.transforming);
        return input;
    });
};

class ImportResolver extends CacheResolver {
    constructor() {
        super(str => {
            const regex = /^https?:\/\/.*/gm;
            return regex.test(str) ? ImportResolver._toAbsolute(str) : str;
        });
        this.staticImports = {};
    }
    static _toAbsolute(href) {
        const link = document.createElement("a");
        link.href = href;
        return link.protocol + "//" + link.host + link.pathname + link.search + link.hash;
    }
    resolve(path) {
        return super.resolve(path, abs => {
            return this._resolve(path);
        });
    }
    _resolve(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.staticImports[path]) {
                return this.staticImports[path];
            } else {
                return yield this._fromExternal(path);
            }
        });
    }
    _fromExternal(path) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", path);
            xhr.onload = v => {
                resolve(xhr.responseText);
            };
            xhr.onerror = e => {
                reject(e);
            };
            xhr.send();
        });
    }
}
var ImportResolver$1 = new ImportResolver();

function _parseImport(source) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const regexResult = /\s*@import\s+"([^"]+)"/.exec(source);
            if (!regexResult) {
                break;
            }
            let importContent;
            importContent = yield _parseImport((yield ImportResolver$1.resolve(regexResult[1])));
            if (!importContent) {
                throw new Error(`Required shader chunk '${ regexResult[1] }' was not found!!`);
            }
            source = source.replace(regexResult[0], `\n${ importContent }\n`);
        }
        return source;
    });
}
var ImportTransformer = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        const transformed = yield _parseImport(input.transforming);
        input.transforming = transformed;
        return input;
    });
};

var json5 = createCommonjsModule(function (module, exports) {
    // json5.js
    // Modern JSON. See README.md for details.
    //
    // This file is based directly off of Douglas Crockford's json_parse.js:
    // https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

    var JSON5 = typeof exports === 'object' ? exports : {};

    JSON5.parse = function () {
        "use strict";

        // This is a function that can parse a JSON5 text, producing a JavaScript
        // data structure. It is a simple, recursive descent parser. It does not use
        // eval or regular expressions, so it can be used as a model for implementing
        // a JSON5 parser in other languages.

        // We are defining the function inside of another function to avoid creating
        // global variables.

        var at,
            // The index of the current character
        lineNumber,
            // The current line number
        columnNumber,
            // The current column number
        ch,
            // The current character
        escapee = {
            "'": "'",
            '"': '"',
            '\\': '\\',
            '/': '/',
            '\n': '', // Replace escaped newlines in strings w/ empty string
            b: '\b',
            f: '\f',
            n: '\n',
            r: '\r',
            t: '\t'
        },
            ws = [' ', '\t', '\r', '\n', '\v', '\f', '\xA0', '\uFEFF'],
            text,
            renderChar = function (chr) {
            return chr === '' ? 'EOF' : "'" + chr + "'";
        },
            error = function (m) {

            // Call error when something is wrong.

            var error = new SyntaxError();
            // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
            error.at = at;
            // These two property names have been chosen to agree with the ones in Gecko, the only popular
            // environment which seems to supply this info on JSON.parse
            error.lineNumber = lineNumber;
            error.columnNumber = columnNumber;
            throw error;
        },
            next = function (c) {

            // If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
            }

            // Get the next character. When there are no more characters,
            // return the empty string.

            ch = text.charAt(at);
            at++;
            columnNumber++;
            if (ch === '\n' || ch === '\r' && peek() !== '\n') {
                lineNumber++;
                columnNumber = 0;
            }
            return ch;
        },
            peek = function () {

            // Get the next character without consuming it or
            // assigning it to the ch varaible.

            return text.charAt(at);
        },
            identifier = function () {

            // Parse an identifier. Normally, reserved words are disallowed here, but we
            // only use this for unquoted object keys, where reserved words are allowed,
            // so we don't check for those here. References:
            // - http://es5.github.com/#x7.6
            // - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
            // - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
            // TODO Identifiers can have Unicode "letters" in them; add support for those.

            var key = ch;

            // Identifiers must start with a letter, _ or $.
            if (ch !== '_' && ch !== '$' && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
                error("Bad identifier as unquoted key");
            }

            // Subsequent characters can contain digits.
            while (next() && (ch === '_' || ch === '$' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9')) {
                key += ch;
            }

            return key;
        },
            number = function () {

            // Parse a number value.

            var number,
                sign = '',
                string = '',
                base = 10;

            if (ch === '-' || ch === '+') {
                sign = ch;
                next(ch);
            }

            // support for Infinity (could tweak to allow other words):
            if (ch === 'I') {
                number = word();
                if (typeof number !== 'number' || isNaN(number)) {
                    error('Unexpected word for number');
                }
                return sign === '-' ? -number : number;
            }

            // support for NaN
            if (ch === 'N') {
                number = word();
                if (!isNaN(number)) {
                    error('expected word to be NaN');
                }
                // ignore sign as -NaN also is NaN
                return number;
            }

            if (ch === '0') {
                string += ch;
                next();
                if (ch === 'x' || ch === 'X') {
                    string += ch;
                    next();
                    base = 16;
                } else if (ch >= '0' && ch <= '9') {
                    error('Octal literal');
                }
            }

            switch (base) {
                case 10:
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                    if (ch === '.') {
                        string += '.';
                        while (next() && ch >= '0' && ch <= '9') {
                            string += ch;
                        }
                    }
                    if (ch === 'e' || ch === 'E') {
                        string += ch;
                        next();
                        if (ch === '-' || ch === '+') {
                            string += ch;
                            next();
                        }
                        while (ch >= '0' && ch <= '9') {
                            string += ch;
                            next();
                        }
                    }
                    break;
                case 16:
                    while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
                        string += ch;
                        next();
                    }
                    break;
            }

            if (sign === '-') {
                number = -string;
            } else {
                number = +string;
            }

            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },
            string = function () {

            // Parse a string value.

            var hex,
                i,
                string = '',
                delim,
                // double quote or single quote
            uffff;

            // When parsing for string values, we must look for ' or " and \ characters.

            if (ch === '"' || ch === "'") {
                delim = ch;
                while (next()) {
                    if (ch === delim) {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (ch === '\r') {
                            if (peek() === '\n') {
                                next();
                            }
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else if (ch === '\n') {
                        // unescaped newlines are invalid; see:
                        // https://github.com/aseemk/json5/issues/24
                        // TODO this feels special-cased; are there other
                        // invalid unescaped chars?
                        break;
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },
            inlineComment = function () {

            // Skip an inline comment, assuming this is one. The current character should
            // be the second / character in the // pair that begins this inline comment.
            // To finish the inline comment, we look for a newline or the end of the text.

            if (ch !== '/') {
                error("Not an inline comment");
            }

            do {
                next();
                if (ch === '\n' || ch === '\r') {
                    next();
                    return;
                }
            } while (ch);
        },
            blockComment = function () {

            // Skip a block comment, assuming this is one. The current character should be
            // the * character in the /* pair that begins this block comment.
            // To finish the block comment, we look for an ending */ pair of characters,
            // but we also watch for the end of text before the comment is terminated.

            if (ch !== '*') {
                error("Not a block comment");
            }

            do {
                next();
                while (ch === '*') {
                    next('*');
                    if (ch === '/') {
                        next('/');
                        return;
                    }
                }
            } while (ch);

            error("Unterminated block comment");
        },
            comment = function () {

            // Skip a comment, whether inline or block-level, assuming this is one.
            // Comments always begin with a / character.

            if (ch !== '/') {
                error("Not a comment");
            }

            next('/');

            if (ch === '/') {
                inlineComment();
            } else if (ch === '*') {
                blockComment();
            } else {
                error("Unrecognized comment");
            }
        },
            white = function () {

            // Skip whitespace and comments.
            // Note that we're detecting comments by only a single / character.
            // This works since regular expressions are not valid JSON(5), but this will
            // break if there are other valid values that begin with a / character!

            while (ch) {
                if (ch === '/') {
                    comment();
                } else if (ws.indexOf(ch) >= 0) {
                    next();
                } else {
                    return;
                }
            }
        },
            word = function () {

            // true, false, or null.

            switch (ch) {
                case 't':
                    next('t');
                    next('r');
                    next('u');
                    next('e');
                    return true;
                case 'f':
                    next('f');
                    next('a');
                    next('l');
                    next('s');
                    next('e');
                    return false;
                case 'n':
                    next('n');
                    next('u');
                    next('l');
                    next('l');
                    return null;
                case 'I':
                    next('I');
                    next('n');
                    next('f');
                    next('i');
                    next('n');
                    next('i');
                    next('t');
                    next('y');
                    return Infinity;
                case 'N':
                    next('N');
                    next('a');
                    next('N');
                    return NaN;
            }
            error("Unexpected " + renderChar(ch));
        },
            value,
            // Place holder for the value function.

        array = function () {

            // Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                while (ch) {
                    if (ch === ']') {
                        next(']');
                        return array; // Potentially empty array
                    }
                    // ES5 allows omitting elements in arrays, e.g. [,] and
                    // [,null]. We don't allow this in JSON5.
                    if (ch === ',') {
                        error("Missing array element");
                    } else {
                        array.push(value());
                    }
                    white();
                    // If there's no comma after this value, this needs to
                    // be the end of the array.
                    if (ch !== ',') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },
            object = function () {

            // Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                while (ch) {
                    if (ch === '}') {
                        next('}');
                        return object; // Potentially empty object
                    }

                    // Keys can be unquoted. If they are, they need to be
                    // valid JS identifiers.
                    if (ch === '"' || ch === "'") {
                        key = string();
                    } else {
                        key = identifier();
                    }

                    white();
                    next(':');
                    object[key] = value();
                    white();
                    // If there's no comma after this pair, this needs to be
                    // the end of the object.
                    if (ch !== ',') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

        value = function () {

            // Parse a JSON value. It could be an object, an array, a string, a number,
            // or a word.

            white();
            switch (ch) {
                case '{':
                    return object();
                case '[':
                    return array();
                case '"':
                case "'":
                    return string();
                case '-':
                case '+':
                case '.':
                    return number();
                default:
                    return ch >= '0' && ch <= '9' ? number() : word();
            }
        };

        // Return the json_parse function. It will have access to all of the above
        // functions and variables.

        return function (source, reviver) {
            var result;

            text = String(source);
            at = 0;
            lineNumber = 1;
            columnNumber = 1;
            ch = ' ';
            result = value();
            white();
            if (ch) {
                error("Syntax error");
            }

            // If there is a reviver function, we recursively walk the new structure,
            // passing each name/value pair to the reviver function for possible
            // transformation, starting with a temporary root object that holds the result
            // in an empty key. If there is not a reviver function, we simply return the
            // result.

            return typeof reviver === 'function' ? function walk(holder, key) {
                var k,
                    v,
                    value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }({ '': result }, '') : result;
        };
    }();

    // JSON5 stringify will not quote keys where appropriate
    JSON5.stringify = function (obj, replacer, space) {
        if (replacer && typeof replacer !== "function" && !isArray(replacer)) {
            throw new Error('Replacer must be a function or an array');
        }
        var getReplacedValueOrUndefined = function (holder, key, isTopLevel) {
            var value = holder[key];

            // Replace the value with its toJSON value first, if possible
            if (value && value.toJSON && typeof value.toJSON === "function") {
                value = value.toJSON();
            }

            // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
            // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
            if (typeof replacer === "function") {
                return replacer.call(holder, key, value);
            } else if (replacer) {
                if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
                    return value;
                } else {
                    return undefined;
                }
            } else {
                return value;
            }
        };

        function isWordChar(c) {
            return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '_' || c === '$';
        }

        function isWordStart(c) {
            return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' || c === '$';
        }

        function isWord(key) {
            if (typeof key !== 'string') {
                return false;
            }
            if (!isWordStart(key[0])) {
                return false;
            }
            var i = 1,
                length = key.length;
            while (i < length) {
                if (!isWordChar(key[i])) {
                    return false;
                }
                i++;
            }
            return true;
        }

        // export for use in tests
        JSON5.isWord = isWord;

        // polyfills
        function isArray(obj) {
            if (Array.isArray) {
                return Array.isArray(obj);
            } else {
                return Object.prototype.toString.call(obj) === '[object Array]';
            }
        }

        function isDate(obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        }

        var objStack = [];
        function checkForCircular(obj) {
            for (var i = 0; i < objStack.length; i++) {
                if (objStack[i] === obj) {
                    throw new TypeError("Converting circular structure to JSON");
                }
            }
        }

        function makeIndent(str, num, noNewLine) {
            if (!str) {
                return "";
            }
            // indentation no more than 10 chars
            if (str.length > 10) {
                str = str.substring(0, 10);
            }

            var indent = noNewLine ? "" : "\n";
            for (var i = 0; i < num; i++) {
                indent += str;
            }

            return indent;
        }

        var indentStr;
        if (space) {
            if (typeof space === "string") {
                indentStr = space;
            } else if (typeof space === "number" && space >= 0) {
                indentStr = makeIndent(" ", space, true);
            } else {
                // ignore space parameter
            }
        }

        // Copied from Crokford's implementation of JSON
        // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
        // Begin
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            meta = { // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        function escapeString(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }
        // End

        function internalStringify(holder, key, isTopLevel) {
            var buffer, res;

            // Replace the value, if necessary
            var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

            if (obj_part && !isDate(obj_part)) {
                // unbox objects
                // don't unbox dates, since will turn it into number
                obj_part = obj_part.valueOf();
            }
            switch (typeof obj_part) {
                case "boolean":
                    return obj_part.toString();

                case "number":
                    if (isNaN(obj_part) || !isFinite(obj_part)) {
                        return "null";
                    }
                    return obj_part.toString();

                case "string":
                    return escapeString(obj_part.toString());

                case "object":
                    if (obj_part === null) {
                        return "null";
                    } else if (isArray(obj_part)) {
                        checkForCircular(obj_part);
                        buffer = "[";
                        objStack.push(obj_part);

                        for (var i = 0; i < obj_part.length; i++) {
                            res = internalStringify(obj_part, i, false);
                            buffer += makeIndent(indentStr, objStack.length);
                            if (res === null || typeof res === "undefined") {
                                buffer += "null";
                            } else {
                                buffer += res;
                            }
                            if (i < obj_part.length - 1) {
                                buffer += ",";
                            } else if (indentStr) {
                                buffer += "\n";
                            }
                        }
                        objStack.pop();
                        buffer += makeIndent(indentStr, objStack.length, true) + "]";
                    } else {
                        checkForCircular(obj_part);
                        buffer = "{";
                        var nonEmpty = false;
                        objStack.push(obj_part);
                        for (var prop in obj_part) {
                            if (obj_part.hasOwnProperty(prop)) {
                                var value = internalStringify(obj_part, prop, false);
                                isTopLevel = false;
                                if (typeof value !== "undefined" && value !== null) {
                                    buffer += makeIndent(indentStr, objStack.length);
                                    nonEmpty = true;
                                    key = isWord(prop) ? prop : escapeString(prop);
                                    buffer += key + ":" + (indentStr ? ' ' : '') + value + ",";
                                }
                            }
                        }
                        objStack.pop();
                        if (nonEmpty) {
                            buffer = buffer.substring(0, buffer.length - 1) + makeIndent(indentStr, objStack.length) + "}";
                        } else {
                            buffer = '{}';
                        }
                    }
                    return buffer;
                default:
                    // functions and undefined should be ignored
                    return undefined;
            }
        }

        // special case...when undefined is used inside of
        // a compound object/array, return null.
        // but when top-level, return undefined
        var topLevelHolder = { "": obj };
        if (obj === undefined) {
            return getReplacedValueOrUndefined(topLevelHolder, '', true);
        }
        return internalStringify(topLevelHolder, '', true);
    };
});

function _parseVariableAttributes(attributes) {
    return json5.parse(attributes);
}
function _generateVariableFetchRegex(variableType) {
    return new RegExp(`(?:@(\\{.+\\}))?\\s*${ variableType }\\s+(?:(lowp|mediump|highp)\\s+)?([a-z0-9A-Z]+)\\s+([a-zA-Z0-9_]+)(?:\\s*\\[\\s*(\\d+)\\s*\\]\\s*)?\\s*;`, "g");
}
function _parseVariables(source, variableType) {
    const result = {};
    const regex = _generateVariableFetchRegex(variableType);
    let regexResult;
    while (regexResult = regex.exec(source)) {
        let name = regexResult[4];
        let type = regexResult[3];
        let precision = regexResult[2];
        let rawAnnotations = regexResult[1];
        let isArray = regexResult[5] !== void 0;
        let arrayCount = undefined;
        if (isArray) {
            arrayCount = parseInt(regexResult[5], 10);
            if (isNaN(arrayCount)) {}
        }
        result[name] = {
            variableName: name,
            variableType: type,
            variablePrecision: precision,
            variableAnnotation: rawAnnotations ? _parseVariableAttributes(rawAnnotations) : {},
            isArray: isArray,
            arrayLength: arrayCount
        };
    }
    return result;
}
var VariableParser = function (type) {
    return function (info) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = _parseVariables(info.transforming, type);
            switch (type) {
                case "uniform":
                    info.info.uniforms = variables;
                    break;
                case "attribute":
                    info.info.attributes = variables;
                    break;
                default:
                    throw new Error("Unknown variable type!!");
            }
            return info;
        });
    };
};

function _removeOtherPart(source, partFlag) {
    const regex = new RegExp(`\s*(?:\/\/+)?\s*@${ partFlag }`, "g");
    while (true) {
        const found = regex.exec(source);
        if (!found) {
            break; // When there was no more found
        }
        let beginPoint = found.index;
        let index = source.indexOf("{", beginPoint); // ignore next {
        const endPoint = _getEndBracketIndex(source, index, "{", "}") + 1;
        if (endPoint < 1) {
            // error no bracket matching
            console.error("Invalid bracket matching!");
            return source;
        }
        source = source.substr(0, beginPoint) + source.substring(endPoint, source.length);
    }
    return source;
}
function _removeSelfOnlyTag(source, partFlag) {
    const regex = new RegExp(`(\s*(?:\/\/+)?\s*@${ partFlag })`, "g");
    while (true) {
        const found = regex.exec(source);
        if (!found) {
            break; // When there was no more found
        }
        let index = source.indexOf("{", found.index); // ignore next {
        let beginPoint = index;
        const endPoint = _getEndBracketIndex(source, index, "{", "}") + 1;
        if (endPoint < 1) {
            // error no bracket matching
            console.error("Invalid bracket matching!");
            return source;
        }
        source = source.substr(0, found.index) + source.substring(beginPoint + 1, endPoint - 1) + source.substring(endPoint + 1, source.length);
    }
    return source;
}
function _getEndBracketIndex(source, startIndex, beginBracket, endBracket) {
    // get index of matching endBracket
    let index = startIndex;
    let bracketCount = 1;
    while (true) {
        if (bracketCount === 0) {
            break;
        }
        index++;
        const nextEndBlacket = source.indexOf(endBracket, index);
        const nextBeginBlacket = source.indexOf(beginBracket, index);
        if (nextEndBlacket < 0) {
            // error no bracket matching
            console.error("Invalid bracket matching!");
            return -1;
        }
        if (nextBeginBlacket < 0) {
            index = nextEndBlacket;
            bracketCount--;
            continue;
        }
        if (nextEndBlacket < nextBeginBlacket) {
            index = nextEndBlacket;
            bracketCount--;
            continue;
        } else {
            index = nextBeginBlacket;
            bracketCount++;
            continue;
        }
    }
    return index;
}
var ShaderSeparator = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        let fragment = _removeSelfOnlyTag(_removeOtherPart(input.transforming, "vert"), "frag");
        let vertex = _removeSelfOnlyTag(_removeOtherPart(input.transforming, "frag"), "vert");
        input.info.fragment = fragment;
        input.info.vertex = vertex;
        return input;
    });
};

function _removeAttributeVariables(source) {
    const regex = /(\s*attribute\s+[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+;)/;
    while (true) {
        let found = regex.exec(source);
        if (!found) {
            break;
        }
        source = source.replace(found[0], "");
    }
    return source;
}
var AttributeVariableRemover = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.info.fragment = _removeAttributeVariables(input.info.fragment);
        return input;
    });
};

function _removeVariableAnnotations(source) {
    let regexResult;
    while (regexResult = /@\{.+\}/g.exec(source)) {
        source = source.substr(0, regexResult.index) + source.substring(regexResult.index + regexResult[0].length, source.length);
    }
    return source;
}
var VariableAnnotationRemover = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.info.fragment = _removeVariableAnnotations(input.info.fragment);
        input.info.vertex = _removeVariableAnnotations(input.info.vertex);
        return input;
    });
};

function _obtainPrecisions(source) {
    const regex = /\s*precision\s+([a-z]+)\s+([a-z0-9]+)/g;
    let result = {};
    while (true) {
        const found = regex.exec(source);
        if (!found) {
            break;
        }
        result[found[2]] = found[1];
    }
    return result;
}
var PrecisionParser = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.info.fragmentPrecision = _obtainPrecisions(input.info.fragment);
        input.info.vertexPrecision = _obtainPrecisions(input.info.vertex);
        return input;
    });
};

function _addPrecision(source, targetType, precision) {
    return `precision ${ precision } ${ targetType };\n` + source;
}
var PrecisionComplementer = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!input.info.fragmentPrecision["float"]) {
            input.info.fragment = _addPrecision(input.info.fragment, "float", "mediump");
            input.info.fragmentPrecision["float"] = "mediump";
        }
        return input;
    });
};

function* _regexGLConfigs(source) {
    const regex = /@([a-zA-Z]+)\(([^)]*)\)/g;
    let regexResult;
    while (regexResult = regex.exec(source)) {
        yield {
            name: regexResult[1],
            args: regexResult[2].split(",")
        };
    }
}
function _enablingFunc(target, enabled) {
    if (enabled) {
        return gl => {
            gl.enable(target);
        };
    } else {
        return gl => {
            gl.disable(target);
        };
    }
}
function _asGLConstants(args, length) {
    if (args.length !== length) {
        throw new Error(`The arguments should contain ${ length } of items but there was ${ args.length }`);
    }
    return args.map(arg => {
        const value = WebGLRenderingContext[arg.toUpperCase().trim()];
        if (value) {
            return value;
        } else {
            throw new Error(`Specified WebGL constant ${ arg } was not found`);
        }
    });
}
function _parseGLConfigs(source) {
    const configs = _regexGLConfigs(source);
    let configResult;
    const result = [];
    let depthEnabled = true,
        blendEnabled = true,
        cullEnabled = true;
    while (configResult = configs.next()) {
        if (configResult.done) {
            break;
        }
        const config = configResult.value;
        switch (config.name) {
            case "NoDepth":
                depthEnabled = false;
                break;
            case "DepthFunc":
                depthEnabled = true;
                const depth = _asGLConstants(config.args, 1);
                result.push(gl => {
                    gl.depthFunc(depth[0]);
                });
                break;
            case "NoBlend":
                blendEnabled = false;
                break;
            case "NoCull":
                cullEnabled = false;
                break;
            case "CullFace":
                cullEnabled = true;
                const cullConfig = _asGLConstants(config.args, 1);
                result.push(gl => {
                    gl.cullFace(cullConfig[0]);
                });
                break;
            case "BlendFunc":
                blendEnabled = true;
                const blendFuncConfig = _asGLConstants(config.args, 2);
                result.push(gl => {
                    gl.blendFunc(blendFuncConfig[0], blendFuncConfig[1]);
                });
                break;
            case "BlendFuncSeparate":
                blendEnabled = true;
                const blendFuncSeparate = _asGLConstants(config.args, 4);
                result.push(gl => {
                    gl.blendFuncSeparate(blendFuncSeparate[0], blendFuncSeparate[1], blendFuncSeparate[2], blendFuncSeparate[3]);
                });
                break;
            case "BlendEquation":
                blendEnabled = true;
                const blendEquation = _asGLConstants(config.args, 1);
                result.push(gl => {
                    gl.blendEquation(blendEquation[0]);
                });
                break;
            case "BlendEquationSeparate":
                blendEnabled = true;
                const blendEquationSeparate = _asGLConstants(config.args, 2);
                result.push(gl => {
                    gl.blendEquationSeparate(blendEquationSeparate[0], blendEquationSeparate[1]);
                });
                break;
        }
    }
    result.unshift(_enablingFunc(WebGLRenderingContext.DEPTH_TEST, depthEnabled));
    result.unshift(_enablingFunc(WebGLRenderingContext.BLEND, blendEnabled));
    result.unshift(_enablingFunc(WebGLRenderingContext.CULL_FACE, cullEnabled));
    return result;
}
var BasicGLConfigParser = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.info.configurator = _parseGLConfigs(input.transforming);
        return input;
    });
};

function _removeAnnotations(source) {
    const regex = /(\s*@[a-zA-Z]*\([^)]*\))/;
    while (true) {
        let found = regex.exec(source);
        if (!found) {
            break;
        }
        source = source.replace(found[0], "");
    }
    return source;
}
var AnnotationRemover = function (input) {
    return __awaiter(this, void 0, void 0, function* () {
        input.transforming = _removeAnnotations(input.transforming);
        return input;
    });
};

class SORTPassParser {
    static parse(source) {
        return __awaiter(this, void 0, void 0, function* () {
            let transformingInfo = {
                origin: source,
                transforming: source,
                info: {
                    fragment: "",
                    vertex: "",
                    uniforms: {},
                    attributes: {},
                    vertexPrecision: {},
                    fragmentPrecision: {},
                    configurator: [],
                    systemRegisterers: [],
                    gomlAttributes: {}
                }
            };
            for (let i = 0; i < SORTPassParser.transformers.length; i++) {
                transformingInfo = yield SORTPassParser.transformers[i](transformingInfo);
            }
            return transformingInfo.info;
        });
    }
}
SORTPassParser.transformers = [CommentRemover, ImportTransformer, VariableParser("uniform"), VariableParser("attribute"), BasicGLConfigParser, AnnotationRemover, ShaderSeparator, AttributeVariableRemover, VariableAnnotationRemover, PrecisionParser, PrecisionComplementer, UniformRegisterer];

class PassFactory {
    /**
     * [Instanciate SORT pass from ISORTPassInfo]
     * @param  {WebGLRenderingContext} gl       [description]
     * @param  {ISORTPassInfo}         passInfo [description]
     * @return {Promise<SORTPass>}              [description]
     */
    static fromSORTPassInfo(gl, passInfo) {
        const vs = new Shader(gl, WebGLRenderingContext.VERTEX_SHADER, passInfo.vertex);
        const fs = new Shader(gl, WebGLRenderingContext.FRAGMENT_SHADER, passInfo.fragment);
        const program = new Program(gl);
        const tasks = [];
        program.update([vs, fs]);
        for (let key in passInfo.gomlAttributes) {
            const registerer = passInfo.gomlAttributes[key].register;
            tasks.push((p, m) => registerer(p.program.uniforms, m));
        }
        const attributes = [];
        for (let key in passInfo.attributes) {
            attributes.push(key);
        }
        const configurators = passInfo.configurator;
        for (let i = 0; i < configurators.length; i++) {
            tasks.push(p => configurators[i](p.program.gl));
        }
        for (let i = 0; i < passInfo.systemRegisterers.length; i++) {
            tasks.push((p, args) => passInfo.systemRegisterers[i](p.program.uniforms, args));
        }
        return new SORTPass(program, attributes, tasks, passInfo);
    }
    static fromSinglePassSORT(gl, src) {
        return __awaiter(this, void 0, void 0, function* () {
            const passInfo = yield PassFactory._sortPassResolver.resolve(src, () => SORTPassParser.parse(src));
            return PassFactory.fromSORTPassInfo(gl, passInfo);
        });
    }
    static passInfoFromSORT(source) {
        const passes = source.split("@Pass").filter(p => p.indexOf("@") >= 0); // Separate with @Pass and if there was some pass without containing @, that would be skipped since that is assumed as empty.
        return Promise.all(passes.map(p => SORTPassParser.parse(p)));
    }
}
PassFactory._sortPassResolver = new SORTPassInfoResolver();

class ExternalResourceResolver extends CacheResolver {
    constructor() {
        super(ExternalResourceResolver._toAbsolute);
    }
    static _toAbsolute(href) {
        const link = document.createElement("a");
        link.href = href;
        return link.protocol + "//" + link.host + link.pathname + link.search + link.hash;
    }
}

class TextFileResolver extends ExternalResourceResolver {
    resolve(path) {
        return super.resolve(path, abs => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", abs);
                xhr.onload = v => {
                    resolve(xhr.responseText);
                };
                xhr.onerror = e => {
                    reject(e);
                };
                xhr.send();
            });
        });
    }
}
var TextFileResolver$1 = new TextFileResolver();

class Material {
    constructor(pass) {
        this.pass = pass;
    }
    draw(arg) {
        this.pass.forEach(p => p.draw(arg));
    }
}

/**
 * Manage factories for materials.
 * Materials can be instanciated with this instance.
 */
class MaterialFactory {
    constructor(gl) {
        this.gl = gl;
    }
    static addMaterialType(typeName, factory) {
        MaterialFactory.factories[typeName] = factory;
        if (MaterialFactory.registerdHandlers[typeName]) {
            MaterialFactory.registerdHandlers[typeName].forEach(t => t());
        }
    }
    static addSORTMaterial(typeName, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const sortInfos = yield PassFactory.passInfoFromSORT(source);
            MaterialFactory.addMaterialType(typeName, gl => {
                const sorts = sortInfos.map(p => PassFactory.fromSORTPassInfo(gl, p));
                return new Material(sorts);
            });
        });
    }
    static addSORTMaterialFromURL(typeName, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = yield TextFileResolver$1.resolve(url);
            yield MaterialFactory.addSORTMaterial(typeName, source);
        });
    }
    static _onRegister(factoryName, handler) {
        if (MaterialFactory.registerdHandlers[factoryName]) {
            MaterialFactory.registerdHandlers[factoryName].push(handler);
        } else {
            MaterialFactory.registerdHandlers[factoryName] = [handler];
        }
    }
    instanciate(typeName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (MaterialFactory.factories[typeName]) {
                return MaterialFactory.factories[typeName](this.gl);
            } else {
                return yield this._waitForRegistered(typeName);
            }
        });
    }
    _waitForRegistered(typeName) {
        return new Promise(resolve => {
            MaterialFactory._onRegister(typeName, () => {
                resolve(MaterialFactory.factories[typeName](this.gl));
            });
        });
    }
}
MaterialFactory.factories = {};
MaterialFactory.registerdHandlers = {};

class MaterialImporterComponent extends Component {
    $mount() {
        if (!this.getValue("type") || !this.getValue("src")) {
            throw new Error("type or src cannot be null in material importer");
        } else {
            MaterialFactory.addSORTMaterialFromURL(this.getValue("type"), this.getValue("src"));
        }
    }
}
MaterialImporterComponent.attributes = {
    type: {
        defaultValue: undefined,
        converter: "String"
    },
    src: {
        defaultValue: undefined,
        converter: "String"
    }
};

class MaterialManagerComponent extends Component {
    $awake() {
        const ns = obtainGomlInterface.ns(this.name.ns);
        this.companion.set(ns("MaterialFactory"), new MaterialFactory(this.companion.get("gl")));
    }
}
MaterialManagerComponent.attributes = {};

class MeshRenderer extends Component {
    $awake() {
        this.getAttribute("targetBuffer").boundTo("_targetBuffer");
        this.getAttribute("layer").boundTo("_layer");
        this.getAttribute("drawOffset").boundTo("_drawOffset");
        this.getAttribute("drawCount").boundTo("_drawCount");
        this.getAttribute("geometry").boundTo("_geometry");
    }
    $mount() {
        this._transformComponent = this.node.getComponent("Transform");
        this._materialContainer = this.node.getComponent("MaterialContainer");
    }
    $render(args) {
        if (this._layer !== args.layer) {
            return;
        }
        if (!this._geometry || !args.material && !this._materialContainer.ready) {
            return; // material is not instanciated yet.
        }
        const renderArgs = {
            targetBuffer: this._targetBuffer,
            geometry: this._geometry,
            attributeValues: null,
            camera: args.camera,
            transform: this._transformComponent,
            buffers: args.buffers,
            viewport: args.viewport,
            drawCount: this._drawCount,
            drawOffset: this._drawOffset,
            sceneDescription: args.sceneDescription
        };
        if (args.material) {
            renderArgs.attributeValues = args.materialArgs;
            args.material.draw(renderArgs);
        } else {
            renderArgs.attributeValues = this._materialContainer.materialArgs;
            this._materialContainer.material.draw(renderArgs);
        }
        this.companion.get("gl").flush();
    }
}
MeshRenderer.attributes = {
    geometry: {
        converter: "Geometry",
        defaultValue: "quad"
    },
    targetBuffer: {
        converter: "String",
        defaultValue: "default"
    },
    layer: {
        converter: "String",
        defaultValue: "default"
    },
    drawCount: {
        converter: "Number",
        defaultValue: Number.MAX_VALUE
    },
    drawOffset: {
        converter: "Number",
        defaultValue: 0
    }
};

class MouseCameraControlComponent extends Component {
    constructor() {
        super(...arguments);
        this._lastScreenPos = { x: NaN, y: NaN };
        this._origin = new Vector3(0, 0, 0);
        this._xsum = 0;
        this._ysum = 0;
    }
    $awake() {
        this.getAttribute("rotateX").boundTo("_rotateX");
        this.getAttribute("rotateY").boundTo("_rotateY");
        this.getAttribute("moveZ").boundTo("_moveZ");
        this.getAttribute("moveSpeed").boundTo("_moveSpeed");
        this._transform = this.node.getComponent("Transform");
        this._scriptTag = this.companion.get("canvasElement");
    }
    $mount() {
        this._scriptTag.addEventListener("mousemove", this._mouseMove.bind(this));
        this._scriptTag.addEventListener("contextmenu", this._contextMenu.bind(this));
        this._scriptTag.addEventListener("mousewheel", this._mouseWheel.bind(this));
        this._distance = Math.sqrt(Vector3.dot(this._transform.localPosition.subtractWith(this._origin), this._transform.localPosition.subtractWith(this._origin)));
    }
    _contextMenu(m) {
        m.preventDefault();
    }
    _mouseMove(m) {
        if (isNaN(this._lastScreenPos.x)) {
            this._initialDirection = this._transform.localPosition.subtractWith(this._origin);
            this._initialRotation = this._transform.localRotation;
            this._lastScreenPos = {
                x: m.screenX,
                y: m.screenY
            };
        }
        let updated = false;
        const diffX = m.screenX - this._lastScreenPos.x,
              diffY = m.screenY - this._lastScreenPos.y;
        if ((m.buttons & 1) > 0) {
            this._xsum += diffX;
            this._ysum += diffY;
            updated = true;
        }
        if ((m.buttons & 2) > 0) {
            this._origin = this._origin.addWith(this._transform.right.multiplyWith(-diffX * 0.05 * this._moveSpeed)).addWith(this._transform.up.multiplyWith(diffY * 0.05 * this._moveSpeed));
            updated = true;
            this._distance = Math.sqrt(Vector3.dot(this._transform.localPosition.subtractWith(this._origin), this._transform.localPosition.subtractWith(this._origin)));
        }
        if (updated) {
            const rotation = Quaternion.euler(this._ysum * 0.01, this._xsum * 0.01, 0);
            const rotationMat = Matrix.rotationQuaternion(rotation);
            const direction = Matrix.transformNormal(rotationMat, this._initialDirection);
            this._transform.localPosition = this._origin.addWith(Vector3.normalize(direction).multiplyWith(this._distance));
            this._transform.localRotation = Quaternion.multiply(this._initialRotation, rotation);
        }
        this._lastScreenPos = {
            x: m.screenX,
            y: m.screenY
        };
    }
    _mouseWheel(m) {
        this._distance -= m.deltaY * this._moveZ * MouseCameraControlComponent.moveCoefficient;
        this._transform.localPosition = this._transform.localPosition.addWith(this._transform.forward.multiplyWith(m.deltaY * this._moveZ * MouseCameraControlComponent.moveCoefficient));
        m.preventDefault();
    }
}
MouseCameraControlComponent.rotateCoefficient = 0.003;
MouseCameraControlComponent.moveCoefficient = 0.05;
MouseCameraControlComponent.attributes = {
    // Specify the attributes user can intaract
    rotateX: {
        defaultValue: 1,
        converter: "Number"
    },
    rotateY: {
        defaultValue: 1,
        converter: "Number"
    },
    moveZ: {
        defaultValue: 1,
        converter: "Number"
    },
    moveSpeed: {
        defaultValue: 1,
        converter: "Number"
    }
};

class RenderBuffer extends ResourceBase {
    constructor(gl) {
        super(gl);
        this.renderBuffer = gl.createRenderbuffer();
    }
    update(format, width, height) {
        this.gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this.renderBuffer);
        this.gl.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, format, width, height);
        this.valid = true;
    }
    bind() {
        this.gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this.renderBuffer);
    }
    destroy() {
        this.gl.deleteRenderbuffer(this.renderBuffer);
        super.destroy();
    }
}

class RenderBufferComponent extends Component {
    $mount() {
        this.buffer = new RenderBuffer(this.companion.get("gl"));
    }
    $unmount() {
        this.buffer.destroy();
        this.buffer = null;
    }
    $resizeBuffer(arg) {
        if (!this.getValue("name")) {
            throw new Error(`Attribute 'name' must be specified.`);
        }
        this.buffer.update(WebGLRenderingContext.DEPTH_COMPONENT16, arg.width, arg.height);
        arg.buffers[this.getValue("name")] = this.buffer;
    }
}
RenderBufferComponent.attributes = {
    name: {
        converter: "String",
        defaultValue: undefined
    }
};

class RendererComponent extends Component {
    constructor() {
        super(...arguments);
        this._buffers = {};
    }
    $mount() {
        this._gl = this.companion.get("gl");
        this._canvas = this.companion.get("canvasElement");
        this._camera = this.getValue("camera");
        this.attributes.get("camera").addObserver(v => this._camera = v.Value);
        this._viewport = this.getValue("viewport");
        this.attributes.get("viewport").addObserver(v => this._viewport = v.Value);
    }
    $treeInitialized() {
        if (this.node.children.length === 0) {
            this.node.addNode("render-scene", {});
        }
        this.node.broadcastMessage("resizeBuffer", {
            width: this._viewport.Width,
            height: this._viewport.Height,
            buffers: this._buffers
        });
        this.node.broadcastMessage("bufferUpdated", {
            buffers: this._buffers
        });
    }
    $renderViewport(args) {
        this.node.broadcastMessage("render", {
            camera: this._camera,
            viewport: this._viewport,
            buffers: this._buffers,
            loopIndex: args.loopIndex
        });
    }
}
RendererComponent.attributes = {
    camera: {
        converter: "Component",
        defaultValue: "camera",
        target: "Camera"
    },
    viewport: {
        converter: "Viewport",
        defaultValue: "auto"
    }
};

class RendererManagerComponent extends Component {
    $awake() {
        this.getAttribute("bgColor").boundTo("_bgColor");
        this.getAttribute("clearDepth").boundTo("_clearDepth");
    }
    $mount() {
        this.gl = this.companion.get("gl");
    }
    $treeInitialized() {
        this.node.getComponent("LoopManager").register(this.onloop.bind(this), 1000);
        if (this.getValue("complementRenderer") && this.node.getChildrenByNodeName("renderer").length === 0) {
            this.node.addNode("renderer", {});
        }
    }
    onloop(loopIndex) {
        if (this.enabled) {
            const c = this._bgColor;
            this.gl.clearColor(c.R, c.G, c.B, c.A);
            this.gl.clearDepth(this._clearDepth);
            this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
            this.node.broadcastMessage(1, "renderViewport", { loopIndex: loopIndex });
        }
    }
}
RendererManagerComponent.attributes = {
    bgColor: {
        defaultValue: new Color4(0, 0, 0, 0),
        converter: "Color4"
    },
    clearDepth: {
        defaultValue: 1.0,
        converter: "Number"
    },
    complementRenderer: {
        defaultValue: true,
        converter: "Boolean"
    }
};

class Texture2D extends ResourceBase {
    constructor(gl) {
        super(gl);
        this._texParameterChanged = true;
        this._magFilter = WebGLRenderingContext.LINEAR;
        this._minFilter = WebGLRenderingContext.LINEAR;
        this._wrapS = WebGLRenderingContext.REPEAT;
        this._wrapT = WebGLRenderingContext.REPEAT;
        this.texture = gl.createTexture();
    }
    get magFilter() {
        return this._magFilter;
    }
    set magFilter(filter) {
        if (this._magFilter !== filter) {
            this._texParameterChanged = true;
            this._magFilter = filter;
        }
    }
    get minFilter() {
        return this._minFilter;
    }
    set minFilter(filter) {
        if (this._minFilter !== filter) {
            this._texParameterChanged = true;
            this._minFilter = filter;
        }
    }
    get wrapS() {
        return this._wrapS;
    }
    set wrapS(filter) {
        if (this._wrapS !== filter) {
            this._texParameterChanged = true;
            this._wrapS = filter;
        }
    }
    get wrapT() {
        return this._wrapT;
    }
    set wrapT(filter) {
        if (this._wrapT !== filter) {
            this._texParameterChanged = true;
            this._wrapT = filter;
        }
    }
    update(levelOrImage, widthOrFlipY, height, border, format, type, pixels, flipYForBuffer) {
        this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
        let flipY = false;
        let image;
        let width;
        let level;
        if (typeof height === "undefined") {
            flipY = widthOrFlipY ? true : false;
            image = levelOrImage;
        } else {
            level = levelOrImage;
            width = widthOrFlipY;
        }
        this.gl.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
        if (typeof height === "undefined") {
            this.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, this._checkSize(image));
        } else {
            if (typeof pixels === "undefined") {
                pixels = null;
            }
            this.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, level, format, width, height, border, format, type, pixels);
        }
        this.valid = true;
    }
    register(registerNumber) {
        this.gl.activeTexture(WebGLRenderingContext.TEXTURE0 + registerNumber);
        this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
        if (this._texParameterChanged) {
            this._updateTexParameter();
        }
    }
    destroy() {
        super.destroy();
        this.gl.deleteTexture(this.texture);
    }
    // There should be more effective way to resize texture
    _checkSize(img) {
        const w = img.naturalWidth,
              h = img.naturalHeight;
        const size = Math.pow(2, Math.log(Math.min(w, h)) / Math.LN2 | 0); // largest 2^n integer that does not exceed s
        if (w !== h || w !== size) {
            const canv = document.createElement("canvas");
            canv.height = canv.width = size;
            canv.getContext("2d").drawImage(img, 0, 0, w, h, 0, 0, size, size);
            return canv;
        }
        return img;
    }
    _updateTexParameter() {
        this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, this._minFilter);
        this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, this._magFilter);
        this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, this._wrapS);
        this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, this._wrapT);
        this._texParameterChanged = false;
    }
}

class FrameBuffer extends ResourceBase {
    constructor(gl) {
        super(gl);
        this.fbo = gl.createFramebuffer();
    }
    update(boundTo, level, bindIndex) {
        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, this.fbo);
        if (boundTo instanceof Texture2D) {
            if (typeof bindIndex === "undefined") {
                bindIndex = 0;
            }
            if (typeof level === "undefined") {
                level = 0;
            }
            this.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + bindIndex, WebGLRenderingContext.TEXTURE_2D, boundTo.texture, level);
            if (this.gl.checkFramebufferStatus(WebGLRenderingContext.FRAMEBUFFER) !== WebGLRenderingContext.FRAMEBUFFER_COMPLETE) {
                throw new Error("INCOMPLETE framebuffer");
            }
        } else if (boundTo instanceof RenderBuffer) {
            let registerTarget = level;
            if (typeof level === "undefined") {
                registerTarget = WebGLRenderingContext.DEPTH_ATTACHMENT;
            }
            this.gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, registerTarget, WebGLRenderingContext.RENDERBUFFER, boundTo.renderBuffer);
        }
        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
    }
    bind() {
        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, this.fbo);
    }
    destroy() {
        super.destroy();
        this.gl.deleteFramebuffer(this.fbo);
    }
}

class RenderQuadComponent extends Component {
    $awake() {
        this.getAttribute("targetBuffer").boundTo("_targetBuffer");
        this.getAttribute("clearColor").boundTo("_clearColor");
        this.getAttribute("clearColorEnabled").boundTo("_clearColorEnabled");
        this.getAttribute("clearDepthEnabled").boundTo("_clearDepthEnabled");
        this.getAttribute("clearDepth").boundTo("_clearDepth");
    }
    $mount() {
        this._gl = this.companion.get("gl");
        this._canvas = this.companion.get("canvasElement");
        const gr = this.companion.get("GeometryRegistory");
        this._geom = gr.getGeometry("quad");
        this._materialContainer = this.node.getComponent("MaterialContainer");
    }
    $bufferUpdated(args) {
        const out = this.getValue("out");
        if (out !== "default") {
            this._fbo = new FrameBuffer(this.companion.get("gl"));
            this._fbo.update(args.buffers[out]);
        }
        const depthBuffer = this.getValue("depthBuffer");
        if (depthBuffer && this._fbo) {
            this._fbo.update(args.buffers[depthBuffer]);
        }
    }
    $render(args) {
        if (!this._materialContainer.ready) {
            return;
        }
        // bound render target
        if (this._fbo) {
            this._fbo.bind();
            this._gl.viewport(0, 0, args.viewport.Width, args.viewport.Height);
        } else {
            this._gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
            this._gl.viewport(args.viewport.Left, this._canvas.height - args.viewport.Bottom, args.viewport.Width, args.viewport.Height);
        }
        // clear buffer if needed
        if (this._fbo && this._clearColorEnabled) {
            this._gl.clearColor(this._clearColor.R, this._clearColor.G, this._clearColor.B, this._clearColor.A);
            this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
        }
        if (this._clearDepthEnabled) {
            this._gl.clearDepth(this._clearDepth);
            this._gl.clear(WebGLRenderingContext.DEPTH_BUFFER_BIT);
        }
        // make rendering argument
        const renderArgs = {
            targetBuffer: this._targetBuffer,
            geometry: this._geom,
            attributeValues: {},
            camera: null,
            transform: null,
            buffers: args.buffers,
            viewport: args.viewport
        };
        renderArgs.attributeValues = this._materialContainer.materialArgs;
        // do render
        this._materialContainer.material.draw(renderArgs);
        this._gl.flush();
    }
}
RenderQuadComponent.attributes = {
    out: {
        defaultValue: "default",
        converter: "String"
    },
    depthBuffer: {
        defaultValue: undefined,
        converter: "String"
    },
    targetBuffer: {
        defaultValue: "default",
        converter: "String"
    },
    clearColor: {
        defaultValue: "#0000",
        converter: "Color4"
    },
    clearColorEnabled: {
        defaultValue: true,
        converter: "Boolean"
    },
    clearDepthEnabled: {
        defaultValue: true,
        converter: "Boolean"
    },
    clearDepth: {
        defaultValue: 1.0,
        converter: "Number"
    }
};

class RenderSceneComponent extends Component {
    constructor() {
        super(...arguments);
        this._useMaterial = false;
        this._materialArgs = {};
    }
    // messages
    $awake() {
        this.getAttribute("layer").boundTo("_layer");
        this.getAttribute("clearColor").boundTo("_clearColor");
        this.getAttribute("clearColorEnabled").boundTo("_clearColorEnabled");
        this.getAttribute("clearDepthEnabled").boundTo("_clearDepthEnabled");
        this.getAttribute("clearDepth").boundTo("_clearDepth");
        this.getAttribute("camera").boundTo("_camera");
    }
    $mount() {
        this._gl = this.companion.get("gl");
        this._canvas = this.companion.get("canvasElement");
        if (typeof this.getValue("material") !== "undefined") {
            this._onMaterialChanged();
            this._useMaterial = true;
        }
    }
    $bufferUpdated(args) {
        const out = this.getValue("out");
        if (out !== "default") {
            this._fbo = new FrameBuffer(this.companion.get("gl"));
            this._fbo.update(args.buffers[out]);
        }
        const depthBuffer = this.getValue("depthBuffer");
        if (depthBuffer && this._fbo) {
            this._fbo.update(args.buffers[depthBuffer]);
        }
    }
    $render(args) {
        const camera = this._camera ? this._camera : args.camera;
        if (!camera) {
            return;
        }
        if (this._fbo) {
            this._fbo.bind();
            this._gl.viewport(0, 0, args.viewport.Width, args.viewport.Height);
        } else {
            this._gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
            this._gl.viewport(args.viewport.Left, this._canvas.height - args.viewport.Bottom, args.viewport.Width, args.viewport.Height);
        }
        // clear buffer if needed
        if (this._fbo && this._clearColorEnabled) {
            this._gl.clearColor(this._clearColor.R, this._clearColor.G, this._clearColor.B, this._clearColor.A);
            this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
        }
        if (this._clearDepthEnabled) {
            this._gl.clearDepth(this._clearDepth);
            this._gl.clear(WebGLRenderingContext.DEPTH_BUFFER_BIT);
        }
        args.camera.updateContainedScene(args.loopIndex);
        args.camera.renderScene({
            camera: camera,
            buffers: args.buffers,
            layer: this._layer,
            viewport: args.viewport,
            material: this._useMaterial ? this._material : undefined,
            materialArgs: this._useMaterial ? this._materialArgs : undefined,
            loopIndex: args.loopIndex
        });
    }
    _onMaterialChanged() {
        if (!this._materialComponent) {
            this._prepareInternalMaterial();
        } else {
            this._prepareExternalMaterial();
        }
    }
    _prepareExternalMaterial() {
        return __awaiter(this, void 0, void 0, function* () {
            const materialPromise = this.getValue("material");
            const loader = this.companion.get("loader");
            loader.register(materialPromise);
            const material = yield materialPromise;
            this._material = material;
        });
    }
    _prepareInternalMaterial() {
        return __awaiter(this, void 0, void 0, function* () {
            // obtain promise of instanciating material
            const materialPromise = this.getValue("material");
            const loader = this.companion.get("loader");
            loader.register(materialPromise);
            if (!materialPromise) {
                return;
            }
            const material = yield materialPromise;
            const promises = [];
            material.pass.forEach(p => {
                if (p instanceof SORTPass) {
                    for (let key in p.programInfo.gomlAttributes) {
                        const val = p.programInfo.gomlAttributes[key];
                        this.__addAtribute(key, val);
                        this.attributes.get(key).addObserver(v => {
                            this._materialArgs[key] = v.Value;
                        });
                        const value = this._materialArgs[key] = this.getValue(key);
                        if (value instanceof ResourceBase) {
                            promises.push(value.validPromise);
                        }
                    }
                }
            });
            yield Promise.all(promises);
            this._material = material;
        });
    }
}
RenderSceneComponent.attributes = {
    layer: {
        converter: "String",
        defaultValue: "default"
    },
    depthBuffer: {
        defaultValue: undefined,
        converter: "String"
    },
    out: {
        converter: "String",
        defaultValue: "default"
    },
    clearColor: {
        defaultValue: "#0000",
        converter: "Color4"
    },
    clearColorEnabled: {
        defaultValue: true,
        converter: "Boolean"
    },
    clearDepthEnabled: {
        defaultValue: true,
        converter: "Boolean"
    },
    clearDepth: {
        defaultValue: 1.0,
        converter: "Number"
    },
    material: {
        defaultValue: undefined,
        converter: "Material",
        componentBoundTo: "_materialComponent"
    },
    camera: {
        defaultValue: undefined,
        converter: "Component",
        target: "CAMERA"
    }
};

class TextureBufferComponent extends Component {
    $mount() {
        this.buffer = new Texture2D(this.companion.get("gl"));
    }
    $unmount() {
        this.buffer.destroy();
        this.buffer = null;
    }
    $resizeBuffer(arg) {
        if (!this.getValue("name")) {
            throw new Error(`Attribute 'name' must be specified.`);
        }
        this.buffer.update(0, arg.width, arg.height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, null);
        arg.buffers[this.getValue("name")] = this.buffer;
    }
}
TextureBufferComponent.attributes = {
    name: {
        converter: "String",
        defaultValue: undefined
    },
    format: {
        converter: "Enum",
        defaultValue: WebGLRenderingContext.RGBA,
        table: {
            RGBA: WebGLRenderingContext.RGBA,
            RGB: WebGLRenderingContext.RGB
        }
    }
};

class ImageResolver extends ExternalResourceResolver {
    resolve(path) {
        return super.resolve(path, abs => {
            return new Promise((resolve, reject) => {
                const imgTag = new Image();
                imgTag.onload = () => {
                    resolve(imgTag);
                };
                imgTag.onerror = e => {
                    reject(e);
                };
                imgTag.src = abs;
            });
        });
    }
}
var ImageResolver$1 = new ImageResolver();

class TextureComponent extends Component {
    $mount() {
        const src = this.getValue("src");
        this._texture = new Texture2D(this.companion.get("gl"));
        this._texture.magFilter = this.getValue("magFilter");
        this._texture.minFilter = this.getValue("minFilter");
        this._texture.wrapT = this.getValue("wrapT");
        this._texture.wrapS = this.getValue("wrapS");
        this.attributes.get("magFilter").addObserver(v => this._texture.magFilter = v.Value);
        this.attributes.get("minFilter").addObserver(v => this._texture.minFilter = v.Value);
        this.attributes.get("wrapS").addObserver(v => this._texture.wrapS = v.Value);
        this.attributes.get("wrapT").addObserver(v => this._texture.wrapT = v.Value);
        if (src) {
            this._loadTask(src);
        }
    }
    _loadTask(src) {
        return __awaiter(this, void 0, void 0, function* () {
            const img = yield ImageResolver$1.resolve(src);
            this._texture.update(img);
        });
    }
}
TextureComponent.attributes = {
    src: {
        converter: "String",
        defaultValue: undefined
    },
    minFilter: {
        converter: "Enum",
        defaultValue: "LINEAR",
        table: {
            LINEAR: WebGLRenderingContext.LINEAR,
            NEAREST: WebGLRenderingContext.NEAREST,
            NEAREST_MIPMAP_NEAREST: WebGLRenderingContext.NEAREST_MIPMAP_NEAREST,
            NEAREST_MIPMAP_LINEAR: WebGLRenderingContext.NEAREST_MIPMAP_LINEAR,
            LINEAR_MIPMAP_NEAREST: WebGLRenderingContext.LINEAR_MIPMAP_NEAREST,
            LINEAR_MIPMAP_LINEAR: WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
        }
    },
    magFilter: {
        converter: "Enum",
        defaultValue: "LINEAR",
        table: {
            LINEAR: WebGLRenderingContext.LINEAR,
            NEAREST: WebGLRenderingContext.NEAREST
        }
    },
    wrapS: {
        converter: "Enum",
        defaultValue: "REPEAT",
        table: {
            REPEAT: WebGLRenderingContext.REPEAT,
            MIRRORED_REPEAT: WebGLRenderingContext.MIRRORED_REPEAT,
            CLAMP_TO_EDGE: WebGLRenderingContext.CLAMP_TO_EDGE
        }
    },
    wrapT: {
        converter: "Enum",
        defaultValue: "REPEAT",
        table: {
            REPEAT: WebGLRenderingContext.REPEAT,
            MIRRORED_REPEAT: WebGLRenderingContext.MIRRORED_REPEAT,
            CLAMP_TO_EDGE: WebGLRenderingContext.CLAMP_TO_EDGE
        }
    }
};

/**
 * Provides object transformation like translation,rotation,scaling.
 */
class TransformComponent extends Component {
    constructor() {
        super(...arguments);
        /**
         * Local transform matrix representing scaling,rotation and translation of attached object.
         * @return {[type]} [description]
         */
        this.localTransform = new Matrix();
        /**
         * Global transform that consider parent transform and local transform
         * @return {[type]} [description]
         */
        this.globalTransform = new Matrix();
        /**
         * The children transform should be notified when this transform was updated.
         * @type {TransformComponent[]}
         */
        this._children = [];
        /**
         * Calculation cache to
         * @return {[type]} [description]
         */
        this._cachePVM = new Matrix();
        this._cacheVM = new Matrix();
        /**
         * Cache of forward direction of this object
         */
        this._forward = new Vector3([0, 0, -1, 0]);
        /**
         * Cache of up direction of this object.
         */
        this._up = new Vector3([0, 1, 0, 0]);
        /**
         * Cache of right direction of this object.
         */
        this._right = new Vector3([1, 0, 0, 0]);
        this._globalPosition = new Vector3([0, 0, 0]);
        this._globalScale = new Vector3([1, 1, 1]);
    }
    get globalPosition() {
        return this._globalPosition;
    }
    get localPosition() {
        return this._localPosition;
    }
    set localPosition(val) {
        this._localPosition = val;
        this.attributes.get("position").Value = val;
    }
    get localRotation() {
        return this._localRotation;
    }
    set localRotation(val) {
        this._localRotation = val;
        this.attributes.get("rotation").Value = val;
    }
    get globalScale() {
        return this._globalScale;
    }
    get localScale() {
        return this._localScale;
    }
    set localScale(val) {
        this._localScale = val;
        this.attributes.get("scale").Value = val;
    }
    get forward() {
        return this._forward;
    }
    get up() {
        return this._up;
    }
    get right() {
        return this._right;
    }
    calcPVM(camera) {
        mat4.mul(this._cachePVM.rawElements, camera.getProjectionViewMatrix().rawElements, this.globalTransform.rawElements);
        return this._cachePVM;
    }
    calcVM(camera) {
        mat4.mul(this._cacheVM.rawElements, camera.getViewMatrix().rawElements, this.globalTransform.rawElements);
        return this._cacheVM;
    }
    $awake() {
        // register observers
        this.attributes.get("position").addObserver(() => {
            this._localPosition = this.attributes.get("position").Value;
            this.updateTransform();
        });
        this.attributes.get("rotation").addObserver(() => {
            this._localRotation = this.attributes.get("rotation").Value;
            this.updateTransform();
        });
        this.attributes.get("scale").addObserver(() => {
            this._localScale = this.attributes.get("scale").Value;
            this.updateTransform();
        });
        // assign attribute values to field
        this._localPosition = this.attributes.get("position").Value;
        this._localRotation = this.attributes.get("rotation").Value;
        this._localScale = this.attributes.get("scale").Value;
        this.updateTransform();
    }
    $mount() {
        this._parentTransform = this.node.parent.getComponent("Transform");
        if (this._parentTransform) {
            this._parentTransform._children.push(this);
        }
        this.updateTransform();
    }
    $unmount() {
        if (this._parentTransform) {
            this._parentTransform._children.splice(this._parentTransform._children.indexOf(this), 1);
            this._parentTransform = null;
        }
    }
    /**
     * update local transform and global transform.
     * This need to be called if you manually edit raw elements of scale,position or rotation to recalculate transform matricies.
     */
    updateTransform() {
        mat4.fromRotationTranslationScale(this.localTransform.rawElements, this._localRotation.rawElements, this._localPosition.rawElements, this._localScale.rawElements);
        this.updateGlobalTransform();
    }
    /**
     * Update global transoform.
     */
    updateGlobalTransform() {
        if (!this._parentTransform) {
            mat4.copy(this.globalTransform.rawElements, this.localTransform.rawElements);
        } else {
            mat4.mul(this.globalTransform.rawElements, this._parentTransform.globalTransform.rawElements, this.localTransform.rawElements);
        }
        this._updateDirections();
        this._updateGlobalProperty();
        this.node.sendMessage("transformUpdated", this);
        this._children.forEach(v => v.updateGlobalTransform());
    }
    _updateDirections() {
        vec4.transformMat4(this._forward.rawElements, TransformComponent._forwardBase.rawElements, this.globalTransform.rawElements);
        vec4.transformMat4(this._up.rawElements, TransformComponent._upBase.rawElements, this.globalTransform.rawElements);
        vec4.transformMat4(this._right.rawElements, TransformComponent._rightBase.rawElements, this.globalTransform.rawElements);
    }
    _updateGlobalProperty() {
        if (!this._parentTransform) {
            vec3.copy(this._globalPosition.rawElements, this._localPosition.rawElements);
            vec3.copy(this._globalScale.rawElements, this._localScale.rawElements);
        } else {
            vec3.transformMat4(this._globalPosition.rawElements, this._localPosition.rawElements, this._parentTransform.globalTransform.rawElements);
            vec3.transformMat4(this._globalScale.rawElements, this._localScale.rawElements, this._parentTransform.globalTransform.rawElements); // TODO buggy
        }
    }
}
TransformComponent.attributes = {
    "position": {
        converter: "Vector3",
        defaultValue: Vector3.Zero
    },
    "rotation": {
        converter: "Rotation3",
        defaultValue: Quaternion.Identity
    },
    "scale": {
        converter: "Vector3",
        defaultValue: Vector3.One
    }
};
/**
 * Source vector to be multiplied with global transform to calculate forward direction of attached object.
 */
TransformComponent._forwardBase = new Vector4(0, 0, -1, 0);
/**
 * Source vector to be multiplied with global transform to calculate up direction of attached object.
 */
TransformComponent._upBase = new Vector4(0, 1, 0, 0);
/**
 * Source vector to be multiplied with global transform to calculate right direction of attached object.
 */
TransformComponent._rightBase = new Vector4(1, 0, 0, 0);

/**
 * Utility class to parse the arguments of attributes.
 */
class RotationParser {
    /**
     * Parse angle strings.
     * "p" means Pi. Ex) 3/4 p
     * "d" means degree. if this unit was specified, the argument will be parsed as degree. Ex) 90d
     * @param input the string to parse.
     * @returns {number} parsed angle in radians.
     */
    static parseAngle(input) {
        const regex = /^ *(-? *(?:0|[1-9]\d*)(?: *\.\d+)?) *(?:\/ *((?:0|[1-9]\d*)(?: *\.\d+)?))? *(p|prad|deg|d|r|rad)? *$/gm;
        const result = regex.exec(input);
        if (result == null) {
            throw new Error(`faild parse Angle string:'${ input }'`);
        }
        let numerator = parseFloat(result[1]);
        if (result[2]) {
            numerator /= parseFloat(result[2]);
        }
        let unit = result[3];
        if (unit == null) {
            unit = "d";
        }
        if (unit === "r" || unit === "rad") {
            return numerator;
        }
        if (unit === "p" || unit === "prad") {
            return numerator * Math.PI;
        }
        return numerator / 180 * Math.PI;
    }
    /**
     * Parse angle string in 3D.
     * "p" means Pi. Ex) 3/4 p
     * "d" means degree. if this unit was specified, the argument will be parsed as degree. Ex) 90d
     * "eular(x,y,z)" means rotation in eular. This means Z-X-Y rotation like Unity.
     * "axis(angle,x,y,z)" means rotation around specified axis. This means angle radians will be rotated around the axis (x,y,z).
     * This angle can be specified with the character "p" or "d".
     * "x(angle)","y(angle)" or "z(angle)" means rotation around unit axis.
     * This angle can be specified with the character "p" or "d".
     * @param input the string to be parsed as angle in 3D.
     * @returns {Quaternion} parsed rotation in Quaternion.
     */
    static parseRotation3D(input) {
        const reg1 = /^ *(x|y|z) *\(([^\(\)]+)\) *$/gm;
        const reg2 = /^ *axis *\(([^\(\),]+),([^\(\),]+),([^\(\),]+),([^\(\),]+)\) *$/gm;
        const reg3 = /^ *([^\(\),]+),([^\(\),]+),([^\(\),]+) *$/gm;
        const result = reg1.exec(input);
        if (result) {
            if (result[1] === "x") {
                return Quaternion.angleAxis(RotationParser.parseAngle(result[2]), Vector3.XUnit);
            }
            if (result[1] === "y") {
                return Quaternion.angleAxis(RotationParser.parseAngle(result[2]), Vector3.YUnit);
            }
            if (result[1] === "z") {
                return Quaternion.angleAxis(RotationParser.parseAngle(result[2]), Vector3.ZUnit);
            }
        }
        const res2 = reg2.exec(input);
        if (res2) {
            let rotation = RotationParser.parseAngle(res2[1]);
            let x = parseFloat(res2[2]);
            let y = parseFloat(res2[3]);
            let z = parseFloat(res2[4]);
            return Quaternion.angleAxis(rotation, new Vector3(x, y, z));
        }
        const res3 = reg3.exec(input);
        if (res3) {
            return Quaternion.euler(RotationParser.parseAngle(res3[1]), RotationParser.parseAngle(res3[2]), RotationParser.parseAngle(res3[3]));
        }
        throw new Error(`Unknown format for rotation3D:'${ input }'`);
    }
}

function Angle2DConverter(val) {
    return RotationParser.parseAngle(val);
}

function BooleanConverter$2(val) {
    if (typeof val === "boolean") {
        return val;
    } else if (typeof val === "string") {
        switch (val) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                throw new Error(`Invalid string ${ val } for parsing as boolean`);
        }
    }
    throw new Error("Parsing failed");
}

function Color3Converter(val) {
    if (val instanceof Color3) {
        return val;
    } else if (val instanceof Color4) {
        return new Color3(val.R, val.G, val.B);
    } else if (typeof val === "string") {
        return Color3.parse(val);
    } else {
        throw new Error(`${ val } can not be parsed as Color4.`);
    }
}

function Color4Converter(val) {
    if (val instanceof Color4) {
        return val;
    } else if (val instanceof Color3) {
        return new Color4(val.R, val.G, val.B, 1.0);
    } else if (typeof val === "string") {
        return Color4.parse(val);
    } else {
        throw new Error(`${ val } can not be parsed as Color4.`);
    }
}

function ComponentConverter(val) {
    if (!this.declaration["target"]) {
        throw new Error("Component converter require to be specified target");
    }
    if (val instanceof GomlNode) {
        return val.getComponent(this.declaration["target"]);
    } else if (val instanceof Component) {
        if (val.name === this.declaration["target"]) {
            return val; // check component type?
        } else {
            throw new Error(`Specified component must be ${ this.declaration["target"] }`);
        }
    } else {
        return this.tree(val)(this.declaration["target"]).get(0, 0, 0);
    }
}

function EnumConverter(val) {
    if (!this.declaration["table"]) {
        throw new Error("Enum converter needs to be specified table in attribute dictionary");
    }
    if (typeof val === "number") {
        return val;
    }
    if (typeof val === "string") {
        const result = this.declaration["table"][val];
        if (!result) {
            throw new Error("Specified value is not exisiting in the relation table");
        } else {
            return result;
        }
    }
}

function GeometryConverter(val) {
    if (typeof val === "string") {
        return this.companion.get("GeometryRegistory").getGeometry(val);
    } else if (val instanceof Geometry) {
        return val;
    }
}

function MaterialConverter(val) {
    if (typeof val === "string") {
        const regex = /\s*new\s*\(\s*([a-zA-Z\d\-]+)\s*\)/;
        let regexResult;
        if (regexResult = regex.exec(val)) {
            this.component[this.declaration["componentBoundTo"]] = null;
            return this.companion.get("MaterialFactory").instanciate(regexResult[1]);
        } else {
            const mc = this.tree(val)("Material").get();
            this.component[this.declaration["componentBoundTo"]] = mc;
            return mc.materialPromise;
        }
    }
}

function MaterialTextureConverter(val) {
    if (val instanceof Texture2D) {
        return () => val;
    }
    if (typeof val === "string") {
        const queryRegex = /^query\((.*)\)$/m;
        let regexResult;
        // Query texture element
        if (regexResult = queryRegex.exec(val)) {
            const queried = this.tree(regexResult[1]);
            throw new Error("Not implemeneted yet");
        }
        // from backbuffer
        const backbufferRegex = /^backbuffer\((.*)\)$/m;
        if (regexResult = backbufferRegex.exec(val)) {
            return buffers => buffers[regexResult[1]];
        }
        const tex = new Texture2D(this.companion.get("gl"));
        ImageResolver$1.resolve(val).then(t => {
            tex.update(t);
        });
        this.companion.get("loader").register(tex.validPromise);
        return () => tex;
    }
}

function NumberArrayConverter(val) {
    if (val instanceof Array) {
        return val;
    }
    if (typeof val === "string") {
        const splitted = val.split(",");
        return splitted.map(s => Number.parseFloat(s));
    }
}

function NumberConverter(val) {
    return Number.parseFloat(val);
}

function ObjectConverter(val) {
    return val;
}

function Rotation3Converter(val) {
    if (val instanceof Quaternion) {
        return val;
    }
    return RotationParser.parseRotation3D(val);
}

function StringArrayConverter$2(val) {
    if (Array.isArray(val)) {
        return val; // should we check the elements are actualy string?
    } else if (typeof val === "string") {
        const splitted = val.split(",");
        return splitted.map(s => s);
    }
}

function StringConverter$2(val) {
    if (typeof val === "string") {
        return val;
    } else if (typeof val === "undefined") {
        return val;
    } else if (typeof val.toString === "function") {
        return val.toString();
    }
}

function Texture2DConverter(val) {
    if (typeof val === "string") {
        const regex = /^query\((.*)\)$/m;
        let regexResult;
        if (regexResult = regex.exec(val)) {
            const queried = this.tree(regexResult[1]);
        } else {
            const tex = new Texture2D(this.companion.get("gl"));
            ImageResolver$1.resolve(val).then(t => {
                tex.update(t);
            });
            return tex;
        }
    }
}

function Vector2Converter(val) {
    if (val instanceof Vector2) {
        return val;
    } else {
        return Vector2.parse(val);
    }
}

function Vector3Converter(val) {
    if (val instanceof Vector3) {
        return val;
    } else {
        return Vector3.parse(val);
    }
}

function Vector4Converter(val) {
    if (val instanceof Vector4) {
        return val;
    } else {
        return Vector4.parse(val);
    }
}

function _toPixel(parentSize, rep) {
    let regex = /(\d+)\s*%/;
    let regexResult;
    if (regexResult = regex.exec(rep)) {
        const percentage = Number.parseFloat(regexResult[1]);
        return Math.floor(parentSize * percentage * 0.01);
    } else {
        return Math.floor(Number.parseFloat(rep));
    }
}
function ViewportConverter(val) {
    if (val instanceof Rectangle) {
        return val;
    }
    if (typeof val === "string") {
        const canvas = this.companion.get("canvasElement");
        if (val === "auto") {
            return new Rectangle(0, 0, canvas.width, canvas.height);
        } else {
            const sizes = val.split(",");
            if (sizes.length !== 4) {
                throw new Error("Invalid viewport size was specified.");
            } else {
                return new Rectangle(_toPixel(canvas.width, sizes[0]), _toPixel(canvas.height, sizes[1]), _toPixel(canvas.width, sizes[2]), _toPixel(canvas.height, sizes[3]));
            }
        }
    }
    throw new Error(`${ val } could not be parsed`);
}

obtainGomlInterface.register(() => __awaiter(undefined, void 0, void 0, function* () {
    const _$ns = obtainGomlInterface.ns("HTTP://GRIMOIRE.GL/NS/DEFAULT");
    obtainGomlInterface.registerComponent(_$ns("AssetLoadingManager"), AssetLoadingManagerComponent);
    obtainGomlInterface.registerComponent(_$ns("Camera"), CameraComponent);
    obtainGomlInterface.registerComponent(_$ns("CanvasInitializer"), CanvasInitializerComponent);
    obtainGomlInterface.registerComponent(_$ns("Geometry"), GeometryComponent);
    obtainGomlInterface.registerComponent(_$ns("GeometryRegistory"), GeometryRegistoryComponent);
    obtainGomlInterface.registerComponent(_$ns("LoopManager"), LoopManagerComponent);
    obtainGomlInterface.registerComponent(_$ns("Material"), MaterialComponent);
    obtainGomlInterface.registerComponent(_$ns("MaterialContainer"), MaterialContainerComponent);
    obtainGomlInterface.registerComponent(_$ns("MaterialImporter"), MaterialImporterComponent);
    obtainGomlInterface.registerComponent(_$ns("MaterialManager"), MaterialManagerComponent);
    obtainGomlInterface.registerComponent(_$ns("MeshRenderer"), MeshRenderer);
    obtainGomlInterface.registerComponent(_$ns("MouseCameraControl"), MouseCameraControlComponent);
    obtainGomlInterface.registerComponent(_$ns("RenderBuffer"), RenderBufferComponent);
    obtainGomlInterface.registerComponent(_$ns("Renderer"), RendererComponent);
    obtainGomlInterface.registerComponent(_$ns("RendererManager"), RendererManagerComponent);
    obtainGomlInterface.registerComponent(_$ns("RenderQuad"), RenderQuadComponent);
    obtainGomlInterface.registerComponent(_$ns("RenderScene"), RenderSceneComponent);
    obtainGomlInterface.registerComponent(_$ns("Scene"), SceneComponent);
    obtainGomlInterface.registerComponent(_$ns("TextureBuffer"), TextureBufferComponent);
    obtainGomlInterface.registerComponent(_$ns("Texture"), TextureComponent);
    obtainGomlInterface.registerComponent(_$ns("Transform"), TransformComponent);
    obtainGomlInterface.registerConverter(_$ns("Angle2D"), Angle2DConverter);
    obtainGomlInterface.registerConverter(_$ns("Boolean"), BooleanConverter$2);
    obtainGomlInterface.registerConverter(_$ns("Color3"), Color3Converter);
    obtainGomlInterface.registerConverter(_$ns("Color4"), Color4Converter);
    obtainGomlInterface.registerConverter(_$ns("Component"), ComponentConverter);
    obtainGomlInterface.registerConverter(_$ns("Enum"), EnumConverter);
    obtainGomlInterface.registerConverter(_$ns("Geometry"), GeometryConverter);
    obtainGomlInterface.registerConverter(_$ns("Material"), MaterialConverter);
    obtainGomlInterface.registerConverter(_$ns("MaterialTexture"), MaterialTextureConverter);
    obtainGomlInterface.registerConverter(_$ns("NumberArray"), NumberArrayConverter);
    obtainGomlInterface.registerConverter(_$ns("Number"), NumberConverter);
    obtainGomlInterface.registerConverter(_$ns("Object"), ObjectConverter);
    obtainGomlInterface.registerConverter(_$ns("Rotation3"), Rotation3Converter);
    obtainGomlInterface.registerConverter(_$ns("StringArray"), StringArrayConverter$2);
    obtainGomlInterface.registerConverter(_$ns("String"), StringConverter$2);
    obtainGomlInterface.registerConverter(_$ns("Texture2D"), Texture2DConverter);
    obtainGomlInterface.registerConverter(_$ns("Vector2"), Vector2Converter);
    obtainGomlInterface.registerConverter(_$ns("Vector3"), Vector3Converter);
    obtainGomlInterface.registerConverter(_$ns("Vector4"), Vector4Converter);
    obtainGomlInterface.registerConverter(_$ns("Viewport"), ViewportConverter);
    obtainGomlInterface.registerNode("goml", ["CanvasInitializer", "LoopManager", "AssetLoadingManager", "GeometryRegistory", "MaterialManager", "RendererManager"]);
    obtainGomlInterface.registerNode("renderer", ["Renderer"]);
    obtainGomlInterface.registerNode("scene", ["Scene"]);
    obtainGomlInterface.registerNode("camera", ["Transform", "Camera"]);
    obtainGomlInterface.registerNode("empty", []);
    obtainGomlInterface.registerNode("geometry", ["Geometry"]);
    obtainGomlInterface.registerNode("texture", ["Texture"]);
    obtainGomlInterface.registerNode("mesh", ["Transform", "MaterialContainer", "MeshRenderer"]);
    obtainGomlInterface.registerNode("material", ["Material"]);
    obtainGomlInterface.registerNode("import-material", ["MaterialImporter"]);
    obtainGomlInterface.registerNode("texture-buffer", ["TextureBuffer"]);
    obtainGomlInterface.registerNode("render-buffer", ["RenderBuffer"]);
    obtainGomlInterface.registerNode("render-scene", ["MaterialContainer", "RenderScene"]);
    obtainGomlInterface.registerNode("render-quad", ["MaterialContainer", "RenderQuad"]);
    DefaultPrimitives.register();
}));

obtainGomlInterface.register(() => __awaiter(undefined, void 0, void 0, function* () {
    // REGISTER would be replaced to actual codes to register components.
    const _$ns = obtainGomlInterface.ns("HTTP://GRIMOIRE.GL/NS/DEFAULT");
    // You can edit code here.
}));
//# sourceMappingURL=grimoire.es2016.js.map

//# sourceMappingURL=grimoire.js.map