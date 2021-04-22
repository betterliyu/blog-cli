---
title: AngularJS学习笔记：Provider和Service
date: 2017-7-15 17:13:34
tags: 
  - AngularJS
categories: JavaScript
layout: Post

---
## 基本概念 

依赖注入是AngularJS的四大特性之一，在理解AngularJS如果实现依赖注入之前需要知道一些名词概念。

### Service（服务）

服务是一些公共代码的集合（常量，变量，方法或对象），可以在控制器、指令等地方注入并使用。我们可以把控制器中重复的代码抽象成一个个服务的方法，通过服务来调用。AngularJS有许多内置的服务，比如`$http`服务提供ajax的操作，`$filter`提供数据过滤的操作等等。应用程序中所有服务保存在内部变量`instanceCache`中。关于Service有一下几点需要注意：

 - Service是单例的；
 - Service由内部的`$injector`进行实例化，不需要手动实例化；
 - 所有的Service都是保存在一个对象中，内置服务都以`$`开头，所以自定义服务不要以`$`开头，并且不要同名，否则会发生覆盖的情况，在使用第三方库的时候尤其要注意；
 - Service不能注入到config配置块中，配置块中只能注入供应商。

### Provider（供应商）

供应商用来向控制器，指令等提供服务。供应商在定义时会包含一个服务在函数内，AngularJS实例化供应商内部的服务，将其保存在变量中，之后需要注入服务时只需要到变量中获取。

AngularJS提供了一个内置对象`$provider`，这个对象上有5个属性方法： `provide`，`factory`，`service`，`value`，`constant`和`decorator`。其中前面4个都是用来创建provider的，只不过是不同写法而已。`constant`用来创建一个常量，`decorator`用来对其他服务做一些装饰修改。AngularJS也在模块对象上挂在了这几个相同的方法，就是说我们创建一个供应商或服务可以这样写：

```javascript
angular
  .module('app')
  .provide(...)
  .factory(...)
```

应用程序中所有供应商保存在内部变量`providerCache`中。关于Provider有一下几点需要注意：

 - Provider只能注入到config配置块中，在配置块中可以对服务进行最后的修改；
 - 注入的时候需要在定义的服务名称后面加上`Provider`，完整的供应商的名称是`serviceProvider`。

### $Injector（注入器）

`$injector`是实现依赖注入的关键。他是一个内置的服务，提供以下几个方法：    

 - annotate 解析参数列表
 - invoke 调用函数（会自动注入依赖的服务或供应商）
 - instantiate 实例化对象（会自动注入依赖的服务或供应商）
 - get 获取实例（不存在实例则创建）
 - has 判断服务是否已经创建
 - 
`$injector`是通过createInternalInjector方法创建的，在AngularJS内部还通过这个方法创建了两个关键的对象`providerInjector`和`instanceInjector`。`$injector`就是`instanceInjector`，用来操作服务，但是`$injector`可以被我们调用，用来处理其他的函数，比如annotate，invoke和instantiate，可以对普通的函数操作；`providerInjector`用来操作供应商。`get`方法就是从对应的变量（`instanceCache`或者`providerCache`）中获取实例。

## Provider用法

上面说过`$provide`提供多种创建供应商的方法，但是原理都是一样，只是语法糖而已（`constant`和`decorator`除外，需要单独讨论），而这些方法都挂在在了module对象上了，所以我这里只讨论`moudule.provider`方法。 

provider方法用法如下：

```javascript
  angular
    .module('app')
    .provider('freeball', function freeballProvider () {
      var freeballFlag = false;
      this.setFreeball = function (value) {
        freeballFlag = !!value;
      };
      // 必须有这个方法
      this.$get = function freeballFactory() {
        return {
          freeball: freeballFlag 
        }
      };
    })
    .config(function(freeballProvider){
      console.log('我是提供者');
      freeballProvider.setFreeball(true)
      console.dir(freeballProvider)
    })
    .controller('homeController', function (freeball) {
      console.log('我是服务');
      console.dir(freeball)
    });
```

![][1]

查看输出结果你会发现：

1. config中的freeballProvider好像是 `freeballProvider函数`生成的，他只有在this上面绑定的两个函数`setFreeball`和`$get`
2. controller中的freeball好像是`freeballFactory`函数返回的对象，而且属性freeball的值不是`false`而是`true`

实际上，这就是Provider的含义：    

1. 它通过provider方法传入的两个参数，生成了一个带有`$get`方法的对象，这个对象就是供应商，他可以注入到config配置块中(只有`provider`和`constant`创建的供应商可以注入到config中)，对内部的变量做一些修改，这里我们把`freeballFlag`改成了`true`。    
2. 在控制器，指令等需要注入服务的方法执行之前AngularJS会注入它们需要的服务，这些服务当然就是通过调用供应商的`$get`方法生成的了，而且只会生成一次，在不同地方注入的相同服务是同一实例。

所以供应商创建服务的关键就是`this.$get`方法，他被用来调用返回他的返回值，这个返回值就是服务。其他几种创建服务的方法都会在内部添加上`$get`方法，然后调用`provider`。下面我们就会来研究以下源码，看看如何调用`$get`方法，如何实例化并注入到方法中的。



## 源码解析
可以看一下源代码，看一下AngularJS是如何创建供应商

### createInternalInjector方法
```javascript
// 以下是调用createInternalInjector创建注入器的过程，两个注入器都会返回相同结构的对象，
// 但是由于内部返回的方法都是闭包，所以他们是对不同cache进行操作的。
// 可以看出分别是providerCache和instanceCache，两次调用传入的工厂方法也是不一样的。
providerInjector = (providerCache.$injector =
  createInternalInjector(providerCache, function(serviceName, caller) { 
    if (angular.isString(caller)) {
      path.push(caller);
    }
    throw $injectorMinErr('unpr', 'Unknown provider: {0}', path.join(' <- '));
  })),
instanceCache = {},
protoInstanceInjector =
  // 这里传入的工厂方法会根据对应供应商调用get方法返回服务
  createInternalInjector(instanceCache, function(serviceName, caller) {
    var provider = providerInjector.get(serviceName + providerSuffix, caller);
    return instanceInjector.invoke(
        provider.$get, provider, undefined, serviceName);
  }),
instanceInjector = protoInstanceInjector;


function createInternalInjector(cache, factory) {

  // 这是获取服务的方法 
  function getService(serviceName, caller) {
    if (cache.hasOwnProperty(serviceName)) {
      if (cache[serviceName] === INSTANTIATING) {
        throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                  serviceName + ' <- ' + path.join(' <- '));
      }
      // 如果已经有了直接返回
      return cache[serviceName];
    } else {
      try {
        path.unshift(serviceName);
        cache[serviceName] = INSTANTIATING;
        // 如果没有调用工厂方法创建，这个工厂方法就是调用两次createInternalInjector方法创建
        // providerInjector和instanceInjector时传入的方法。创建服务的过程就在第二次调用的方法中。
        cache[serviceName] = factory(serviceName, caller);
        return cache[serviceName];
      } catch (err) {
        if (cache[serviceName] === INSTANTIATING) {
          delete cache[serviceName];
        }
        throw err;
      } finally {
        path.shift();
      }
    }
  }

  // 这是注入参数的方法
  function injectionArgs(fn, locals, serviceName) {
    var args = [],
        // 解析参数列表
        $inject = createInjector.$$annotate(fn, strictDi, serviceName);

    for (var i = 0, length = $inject.length; i < length; i++) {
      var key = $inject[i];
      if (typeof key !== 'string') {
        throw $injectorMinErr('itkn',
                'Incorrect injection token! Expected service name as string, got {0}', key);
      }
      // getService获取服务并添加到参数列表
      args.push(locals && locals.hasOwnProperty(key) ? locals[key] :
                                                        getService(key, serviceName));
    }
    return args;
  }

  function invoke(fn, self, locals, serviceName) {
    if (typeof locals === 'string') {
      serviceName = locals;
      locals = null;
    }

    var args = injectionArgs(fn, locals, serviceName);
    if (isArray(fn)) {
      fn = fn[fn.length - 1];
    }

    if (!isClass(fn)) {
      // http://jsperf.com/angularjs-invoke-apply-vs-switch
      // #5388
      return fn.apply(self, args);
    } else {
      args.unshift(null);
      return new (Function.prototype.bind.apply(fn, args))();
    }
  }


  // 这是实例化供应商的方法
  function instantiate(Type, locals, serviceName) {
    var ctor = (isArray(Type) ? Type[Type.length - 1] : Type);
    // 注入参数
    var args = injectionArgs(Type, locals, serviceName);
    args.unshift(null);
    // 这里用了new操作符创建了供应商，所以我们看到freeballProvider对象上面只有绑定到this上的方法
    return new (Function.prototype.bind.apply(ctor, args))();
  }


  return {
    invoke: invoke,
    instantiate: instantiate,
    get: getService,
    annotate: createInjector.$$annotate,
    has: function(name) {
      return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
    }
  };
}

```

### 供应商实例创建过程
```javascript
// 这是provider方法
function provider(name, provider_) {
  assertNotHasOwnProperty(name, 'service');
  if (isFunction(provider_) || isArray(provider_)) {
    // 这里调用instantiate方法来生成供应商Provider
    provider_ = providerInjector.instantiate(provider_);
  }
  if (!provider_.$get) {
    throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
  }
  // 这里将你定义的名字加上“Provider”后缀，然后将生成的provider_添加到一个缓存对象中
  // 所以其实我们创建的freeball供应商其实被保存成了freeballProvider，放在provideCache中
  return providerCache[name + providerSuffix] = provider_;
}

```

### 服务实例创建过程

```javascript
// 我这里只以控制器为例
// 这是初始化控制器对象的代码
function $controllerInit() {
  // 这里调用了$injector.invoke，通过调试，结合invoke方法的内部实现，不难发现angularjs在调用控制
  // 器之前，对参数进行了解析和实例化，最后注入到函数中，同时保存在了cache中，以保证下次注入不需
  // 要重新创建
  var result = $injector.invoke(expression, instance, locals, constructor);
  if (result !== instance && (isObject(result) || isFunction(result))) {
    instance = result;
    if (identifier) {
      // If result changed, re-assign controllerAs value to scope.
      addIdentifier(locals, identifier, instance, constructor || expression.name);
    }
  }
  return instance;
}, {
  instance: instance,
  identifier: identifier
}
```

以上只是创建供应商和服务大概流程。需要好好的研究源码的结构和调用栈才能理解它的执行过程。当然不排除我有可能理解错误，仅供参考。

  [1]: ./AngularJS学习笔记-Provider和Service/2017-08-18_22h47_58.png
