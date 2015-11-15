# hapi-method-change

[Hapi](http://hapijs.com/) plugin for changing form methods from post to put, delete or patch.

Similar to the approach taken by [Express/Sails](https://github.com/expressjs/method-change), and [Rails](http://guides.rubyonrails.org/form_helpers.html#how-do-forms-with-patch-put-or-delete-methods-work-questionmark)

Note: The request pipeline in [hapi](http://hapijs.com/) allows incoming request methods to be changed at the 'onRequest' extension point of the [request lifecycle](http://hapijs.com/api#request-lifecycle). At this point however, the request stream has not been processed, and so 'payload'/form data is not yet available. This means that in addition to the hidden form field approach taken by Express and Rails, we'll need to include a query string 'signal' to trigger the method change, and then later in the pipeline verify the method against the hidden form field value. The extra verification is needed to protect against malicious changes of querystring values. For example, a 'get' request that's been changed to a 'delete' request. 
 
The form will therefore need both a querystring value, and a hidden field for the requested method. 

```
<form action="/users/112?_method=delete" method="POST">
  <input name="_method" id="_method" value="delete" type="hidden" />
  ...
</form>
```

Also note that if you use this plugin in combination with the [Crumb](https://github.com/hapijs/crumb) csrf module, the crumb module will need to be patched as follows: [https://github.com/58bits/crumb/blob/master/lib/index.js#L95](https://github.com/58bits/crumb/blob/master/lib/index.js#L95)

## Installation

`npm install hapi-method-change --save`

## Registering the Plugin
   
    server.register(require('hapi-method-change'), function(err) {
      if (err) {
        console.log('Failed loading plugin');
      }
    });

## Handlebars Block Helper

Here's a [Handlebars](http://handlebarsjs.com/) block helper that creates form blocks with the required querystring and hidden form field.
(The helper helpers are based on [https://github.com/badsyntax/handlebars-form-helpers](https://github.com/badsyntax/handlebars-form-helpers)) 

```javascript
'use strict';

var Qs            = require('querystring');
var Handlebars    = require('handlebars');
var MarkupHelper  = require('../../lib/markupHelpers');

var helperHidden  = MarkupHelper.helperHidden;
var createElement = MarkupHelper.createElement;
var extend        = MarkupHelper.extend;

let internals = {};

internals.parseUrl = function parseUrl(path) {
  if(path.indexOf('?') !== -1) {
    let parts = path.split('?');
    return {
      path: parts[0],
      qs: Qs.parse(parts[1])
    }
  } else {
    return {
      path: path,
      qs: {}
    }
  }
};

internals.stringifyUrl = function stringifyUrl(parts) {
  return parts.path + '?' + Qs.stringify(parts.qs);
};

module.exports = function form(url, method, options) {
  method = method.toLowerCase();
  let content = '';

  if(method !== 'post') {
    let parts = internals.parseUrl(url);
    parts.qs._method = method;
    url = internals.stringifyUrl(parts);
    content = helperHidden('_method', method, {hash: {}});
    content += options.fn(this);
  } else {
    content = options.fn(this);
  }

  return createElement('form', true, extend({
    action: url,
    method: 'POST'
  }, options.hash), content);
};

```

And here's how you use it, supplying url and method along with any other attributes.

```html
{{#form '/your/route' 'put' id="your-form" class="your-class"}}
  <input type="text" name="name" id="name">
  <input class="btn btn-ok" type="submit" value="OK">
{{/form}}

```

Which produces this...

```html
<form action="/your/route?_method=put" method="POST" id="your-form" class="your-class" >
  <input name="_method" id="_method" value="put" type="hidden" />
  <input type="text" name="name" id="name">
  <input class="btn btn-ok" type="submit" value="OK">
</form>
```