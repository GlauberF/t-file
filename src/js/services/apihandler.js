(function(angular, $) {
    'use strict';
    angular.module('FileManagerApp').service('apiHandler', ['$http', '$q', '$window', '$translate', 'Upload',
        function($http, $q, $window, $translate, Upload) {

            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            // $http.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('vimbo_token');

            var ApiHandler = function() {
                this.inprocess = false;
                this.asyncSuccess = false;
                this.error = '';
            };

            ApiHandler.prototype.deferredHandler = function(data, deferred, code, defaultMsg) {
                if (!data || typeof data !== 'object') {
                    this.error = 'Error %s - erro na resposta da API VIMBO(v-doc), aguarde estamos trabalhando para resolver.'.replace('%s', code);
                }
                if (code == 404) {
                    this.error = 'Error 404 - erro na resposta da API VIMBO(v-doc), aguarde estamos trabalhando para resolver.';
                }
                if (data.result && data.result.error) {
                    this.error = data.result.error;
                }
                if (!this.error && data.error) {
                    this.error = data.error.message;
                }
                if (!this.error && defaultMsg) {
                    this.error = defaultMsg;
                }
                if (this.error) {
                    return deferred.reject(data);
                }
                return deferred.resolve(data);
            };

            ApiHandler.prototype.list = function(apiUrl, path, customDeferredHandler) {
                var self = this;
                var dfHandler = customDeferredHandler || self.deferredHandler;
                var deferred = $q.defer();
                var data = {
                    action: 'list',
                    path: path
                };

                self.inprocess = true;
                self.error = '';

                // ok - refatorado
                $http.post(apiUrl, data).then(function(data) {
                    console.log('[listar] =>', data);
                    dfHandler(data.data, deferred, data.status);
                }, function(data) {
                    dfHandler(data.data, deferred, data.status, 'O servidor esta sofrendo de instabilidade, aguarde.');
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.copy = function(apiUrl, items, path, singleFilename) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'copy',
                    items: items,
                    newPath: path
                };

                if (singleFilename && items.length === 1) {
                    data.singleFilename = singleFilename;
                }

                // ok - refatorado
                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    console.log('[copiar] =>', data);
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_copying'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.move = function(apiUrl, items, path) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'move',
                    items: items,
                    newPath: path
                };

                // ok - refatorado
                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_moving'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.remove = function(apiUrl, items) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'remove',
                    items: items
                };

                // ok - refatorado
                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_deleting'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.upload = function(apiUrl, destination, files) {
                var self = this;
                var deferred = $q.defer();
                self.inprocess = true;
                self.progress = 0;
                self.error = '';

                var data = {
                    destination: destination
                };

                for (var i = 0; i < files.length; i++) {
                    data['file-' + i] = files[i];
                }

                if (files && files.length) {
                    Upload.upload({
                        url: apiUrl,
                        data: data
                    }).then(function(data) {
                        self.deferredHandler(data.data, deferred, data.status);
                    }, function(data) {
                        self.deferredHandler(data.data, deferred, data.status, 'Erro ao fazer upload do arquivo');
                    }, function(evt) {
                        self.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total)) - 1;
                    })['finally'](function() {
                        self.inprocess = false;
                        self.progress = 0;
                    });
                }

                return deferred.promise;
            };

            ApiHandler.prototype.getContent = function(apiUrl, itemPath) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'getContent',
                    item: itemPath
                };

                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_getting_content'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.edit = function(apiUrl, itemPath, content) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'edit',
                    item: itemPath,
                    content: content
                };

                self.inprocess = true;
                self.error = '';

                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_modifying'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.rename = function(apiUrl, itemPath, newPath) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'rename',
                    item: itemPath,
                    newItemPath: newPath
                };
                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_renaming'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.getUrl = function(apiUrl, path) {
                var data = {
                    action: 'download',
                    path: path,
                    token: window.localStorage.getItem('vimbo_token')
                };
                // return path && [apiUrl, $.param(data)].join('?');
                // console.log('url feita na mao', 'https://vimbo-gestao.ml/storage/empresas/' + window.localStorage.e + data.path);
                return path && [apiUrl, $.param(data)].join('?');
            };

            ApiHandler.prototype.download = function(apiUrl, itemPath, toFilename, downloadByAjax, forceNewWindow) {
                var self = this;
                var url = this.getUrl(apiUrl, itemPath);

                if (!downloadByAjax || forceNewWindow || !$window.saveAs) {
                    !$window.saveAs && $window.console.log('Seu navegador não suporta o download via ajax, baixando modo padrão');
                    return !!$window.open(url, '_blank', '');
                }

                var deferred = $q.defer();
                self.inprocess = true;
                $http.get(url, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('vimbo_token') }
                }).then(function(data) {
                    var bin = new $window.Blob([data]);
                    deferred.resolve(data);
                    $window.saveAs(bin, toFilename);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_downloading'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.downloadMultiple = function(apiUrl, items, toFilename, downloadByAjax, forceNewWindow) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'downloadMultiple',
                    items: items,
                    toFilename: toFilename,
                    token: window.localStorage.getItem('vimbo_token')
                };
                var url = [apiUrl, $.param(data)].join('?');

                if (!downloadByAjax || forceNewWindow || !$window.saveAs) {
                    !$window.saveAs && $window.console.log('Seu navegador não suporta o download via ajax, baixando modo padrão');
                    return !!$window.open(url, '_blank', '');
                }

                self.inprocess = true;
                $http.get(apiUrl, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('vimbo_token') }
                }).then(function(data) {
                    var bin = new $window.Blob([data]);
                    deferred.resolve(data);
                    $window.saveAs(bin, toFilename);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_downloading'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.compress = function(apiUrl, items, compressedFilename, path) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'compress',
                    items: items,
                    destination: path,
                    compressedFilename: compressedFilename
                };

                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_compressing'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.extract = function(apiUrl, item, folderName, path) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'extract',
                    item: item,
                    destination: path,
                    folderName: folderName
                };

                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_extracting'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.changePermissions = function(apiUrl, items, permsOctal, permsCode, recursive) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'changePermissions',
                    items: items,
                    perms: permsOctal,
                    permsCode: permsCode,
                    recursive: !!recursive
                };

                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_changing_perms'));
                })['finally'](function() {
                    self.inprocess = false;
                });
                return deferred.promise;
            };

            ApiHandler.prototype.createFolder = function(apiUrl, path) {
                var self = this;
                var deferred = $q.defer();
                var data = {
                    action: 'createFolder',
                    newPath: path
                };

                self.inprocess = true;
                self.error = '';
                $http.post(apiUrl, data).then(function(data) {
                    self.deferredHandler(data.data, deferred, data.status);
                }, function(data) {
                    self.deferredHandler(data.data, deferred, data.status, $translate.instant('error_creating_folder'));
                })['finally'](function() {
                    self.inprocess = false;
                });

                return deferred.promise;
            };

            return ApiHandler;

        }
    ]);
})(angular, jQuery);