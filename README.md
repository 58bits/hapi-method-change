# hapi-method-override

[Hapi](http://hapijs.com/) plugin for changing form methods from post to put, delete or patch.

Similar to the approach taken by [Express/Sails](https://github.com/expressjs/method-override), and [Rails](http://guides.rubyonrails.org/form_helpers.html#how-do-forms-with-patch-put-or-delete-methods-work-questionmark)

Note: The request pipeline in [hapi](http://hapijs.com/) allows incoming request methods to be changed at the 'onRequest' extension point of the [request lifecycle](http://hapijs.com/api#request-lifecycle). At this point however, the request stream has not been processed, and so 'payload' and any form data is not yet available. This means that in addition to the hidden form field approach taken by Express and Rails, we'll need to include a query string 'signal' to trigger the method change, and then later in the pipeline verify the method against the hidden form field value. The extra verification is needed to protect against malicious changes of querystring values. For example, a 'get' request that's been changed to a 'delete' request. 
 
The form will therefore need both a querystring value, and a hidden field for the requested method. 

```
<form action="/users/112?_method=delete" method="POST">
  <input name="_method" id="_method" value="delete" type="hidden" />
  ...
</form>
```

Also note that if you use this plugin in combination with the [Crumb](https://github.com/hapijs/crumb) csrf module, the crumb module will need to be patched as follows: [https://github.com/58bits/crumb/blob/master/lib/index.js#L95](https://github.com/58bits/crumb/blob/master/lib/index.js#L95)

## Installation

`npm install hapi-method-override --save`

## Registering the Plugin
   
    server.register(require('hapi-method-override'), function(err) {
      if (err) {
        console.log('Failed loading plugin');
      }
    });

