# gf-file

### Features
  - Multilanguage (English, Chinese, Spanish, Russian, Portuguese, French, German, Italian, Slovak, Hebrew, Persian, Polish, Ukrainian, Turkish, etc...)
  - Multiple templates (List / Icons)
  - Multiple file upload
  - Multiple file support
  - Pick files callback for third parties apps
  - Search files
  - Directory tree navigation
  - Copy, Move, Rename (Interactive UX)
  - Delete, Edit, Preview, Download
  - File permissions (Unix chmod style)
  - Mobile support

### TODO
  - Drag and drop
  - Dropbox and Google Drive compatibility
  - Extend backend bridges (PHP, Java, Python, Node, .Net)
  - Migrate jQuery to native or angular.element

### Backend API
[docs](API.md)

---------

### Use in your existing project
**1) Install and use**
```bower install --save https://github.com/GlauberF/gf-file.git```

---------

### Extending the configuration file
```html
<script type="text/javascript">
angular.module('FileManagerApp').config(['fileManagerConfigProvider', function (config) {
  var defaults = config.$get();
  config.set({
    appName: 'angular-filemanager',
    pickCallback: function(item) {
      var msg = 'Picked %s "%s" for external use'
        .replace('%s', item.type)
        .replace('%s', item.fullPath());
      window.alert(msg);
    },

    allowedActions: angular.extend(defaults.allowedActions, {
      pickFiles: true,
      pickFolders: false,
    }),
  });
}]);
</script>
```

You can do many things by extending the configuration. Like hide the sidebar or the search button. See [the list of default configurations](/src/js/providers/config.js).

---------

### Author
Glauber Funez


