ACC.bulksearch = {

    _autoload: [
        "bindBulkSearch"
        // ,
        // "bindDisableSearch"
    ],

    bindBulkSearch: function () {
        //private block
        var $bulkSearch = $(".js-site-search-bulk-mode");
        var template = $("#bulkSearchTemplate");
        var productListTemplate = $("#bulkSearchProductListTemplate");
        var $component;

        var requestTimer = 0;

        var productExample = {
            code : "458542",
            name: "Mini T-Cam",
            images: [ {
                altText: null,
                format: "thumbnail",
                url : "/medias/?context=bWFzdGVyfGltYWdlc3wxNTA1fGltYWdlL2pwZWd8aW1hZ2VzL2hlYi9oZWQvODc5Njg2ODExNjUxMC5qcGd8YmZlOTExZWMxOTdhYTc0NjJiYmM5NzUyZTUzM2UwMmJhOThjMzI4ODc5MmVjMmVjZDBjZTNkY2I0ZjBmYzA1ZQ"
            }, {
                altText: null,
                format: "product",
                url: "/medias/?context=bWFzdGVyfGltYWdlc3w1MjgxfGltYWdlL2pwZWd8aW1hZ2VzL2gzNC9oZjkvODc5Njg0MTc3MTAzOC5qcGd8NDBjMGJkYmI1NTJmNGQ0ODI5YzZmYzk5YjFlNjgwNTVmMTkyMTRjZTA2MzdmMDZlZTg1ZjNiZjMwNDM5NzRiMg"
            } ],
            price : { formattedValue: "$34.53" },
            stock : { stockLevelStatus: {code: "inStock"} }
        };
        var cachedProducts = {};

        var _this = null;

        $.widget("custom.bulksearch", {
            _create: function() {
                _this = this;
                
                _this.bindOpen();
            },

            bindOpen: function() {
                $bulkSearch.click(_this.initBulkSearch);
            },

            bindEvents: function() {
                $component.on("click", ".js-site-search-bulk-mode__close-button", _this.close);
                $component.on("click", ".js-add-to-cart", _this.addToCart);
                $component.on("click", ".select-this-option", _this.selectProduct);
                $component.on("keypress keyup", ".js-site-search-bulk-mode__editor ", _this.onEdit);
            },

            initBulkSearch: function($event) {
                $event.preventDefault();

                var data = {products: []};

                _this.render(data);
            },

            close: function () {
                $component.remove();
                //UNBIND events?
            },

            onEdit: function () {
                _this.sanitizeInputArea();
                _this.adjustHeight();

                _this.loadProducts();
            },

            selectProduct: function (event) {
                event.preventDefault();

                var code = $(event.target).data('code');
                
                var productCacheKey;
                var productCacheValue;

                Object.keys(cachedProducts).forEach(function(key){
                    var cachedElement = cachedProducts[key];

                    // FIXME: Array.isArray works for IE9+
                    if (Array.isArray(cachedElement)) {
                        cachedElement.forEach(function(product) {
                            if (product.code == code) {
                                productCacheKey = key;
                                productCacheValue = product;
                            }
                        })
                    }
                });

                if (productCacheKey && productCacheValue) {
                    _this.setToCache(productCacheKey, productCacheValue);

                    _this.onEdit();

                    $component.find('textarea').focus();
                }
            },

            addToCart: function(event) {
                event.preventDefault();

                var request = {
                    qty: 1,
                    productCodePost: $(event.target).data('code')
                };

                $.ajax({
                    type: "POST",
                    url: "/trainingstorefront/electronics/en/cart/add",
                    data: request,
                    success: ACC.product.displayAddToCartPopup
                });

                //Request URL:
                //Request Method:POST

                //options.data = "CSRFToken=" + ACC.config.CSRFToken;

                //qty=1&productCodePost=1422222&CSRFToken=631820c5-2993-463f-9aff-1160a5e10f59

                return false;
            },

            render: function() {
                try {
                    $component = template.tmpl()
                        .insertAfter("#js-site-search-input");

                    _this.bindEvents();
                } catch (e) {
                    console.warn('Bulk Search >> Template parsing error', e);
                }
            },

            prepareModel: function (productList) {
                return productList.products.map(function(product) {

                    //GET first thumbnail
                    if (!product) {
                        console.warn('prepareModel >> No product');
                        product = {};
                        product.thumbnail = '';
                        return product;
                    }

                    if (Array.isArray(product)) {
                        
                        product = product.map(function(product) {
                            addThumbnail(product);

                            return product;
                        });
                    } else {
                        addThumbnail(product);
                    }

                    return product;
                });

                function addThumbnail(product) {
                    if (product.images) {
                        product.thumbnail = product.images.reduce(function(thumbnail, image) {
                            if (thumbnail) {
                                return thumbnail;
                            } else {
                                if (image.format = "thumbnail") {
                                    return image.url;
                                }
                            }
                        }, null);
                    }
                }
            },

            renderProductList: function (productList) {
                var $productListArea = $(".js-site-search-bulk-mode__result-area");
                var updatedModel = {};

                $productListArea.empty();

                updatedModel.products = _this.prepareModel(productList);

                productListTemplate.tmpl(updatedModel)
                    .appendTo($productListArea);
            },

            setToCache: function(key, product) {
                cachedProducts[key] = product;
            },

            isInCache: function (key) {
                return !!cachedProducts[key];
            },

            getFromCache: function (key) {
                //FIXME?: return empty object
                return cachedProducts[key] || null;
            },

            loadProducts: function () {
                console.log('loadProducts');
                
                var productKeys = $component.find('textarea').val().split('\n');
                var dataForTemplate = {products: [ ]};

                dataForTemplate.products = productKeys.map(function(productKey) {
                    if (productKey && _this.isInCache(productKey)) {
                        //FIXME: demo hack
                        if (productKey == 4) {
                            return _this.getFromCache(productKey);
                        } else {
                            return _this.getFromCache(productKey)[0];
                        }
                    } else {
                        return {name: '', productKey: productKey}
                    }
                });


                //Render from cache
                _this.renderProductList(dataForTemplate);

                //Remove dups and cached
                var productKeysForSearch = productKeys.reduce(function (result, productKey) {
                    if (_this.isInCache(productKey) || result.indexOf(productKey) != -1 || !productKey) {
                        return result;
                    } else {
                        return result.concat(productKey);
                    }
                }, []);

                if (productKeysForSearch.length) {

                    if (requestTimer) {
                        clearTimeout(requestTimer);
                    }

                    requestTimer = setTimeout(function() {
                        ACC.bulksearch.UTIL.getProducts(productKeysForSearch, function (newProductsMap) {
                            
                            Object.keys(newProductsMap).forEach(function(value) {
                                var productKey = value;

                                _this.setToCache(productKey, newProductsMap[value]);
                            });

                            dataForTemplate = {products: [ ]};

                            dataForTemplate.products = productKeys.map(function(productKey) {
                                if (_this.isInCache(productKey)) {

                                    //FIXME: demo hack
                                    if (productKey == 4) {
                                        return _this.getFromCache(productKey);
                                    } else {
                                        return _this.getFromCache(productKey)[0];
                                    }
                                } else {
                                    return {name: productKey + ' Not Found', thumbnail: ''}
                                }
                            });

                            _this.renderProductList(dataForTemplate);
                        });
                    }, 400);
                }
            },

            sanitizeInputArea: function() {
                var $textarea = $component.find('textarea');

                //TODO: sanitize event properly
                // - do not remove from middle of text
                $textarea.val($textarea.val()
                                    .replace(/\n\n/g, '\n')
                                    .replace(/,/g, '\n')
                );
            },

            adjustHeight: function() {
                var $textarea = $component.find('textarea');
                var text = $textarea.val();

                window.test = text;

                var height = (text.split(/\n/).length + 1) * 26;
                $textarea.height(height);
            }
        });

        $bulkSearch.bulksearch();

    }
};

ACC.bulksearch.UTIL = {
    getProducts: function getProducts(productList, callback) {
        var getarray = [],

        getarray = productList.map(function(productKey) {
            if (productKey) {
                return ACC.bulksearch.UTIL.getProduct(productKey);
            }
        });

        $.when.apply($, getarray).done(function() {
            var result = {};

            if (typeof arguments == "object" && arguments.length) {
                if (getarray.length == 1) {
                    var value = arguments[0];

                    if (value && value.products && value.products[0]) {
                        result[productList[0]] = value.products;
                    }
                } else
                    {
                    Array.apply(null, arguments).forEach(function (xhr, index){
                        var value = xhr[0];

                        //FIXME: add more validation
                        if (value && value.products && value.products[0]) {
                            result[productList[index]] = value.products;
                        }
                    });
                }
            }

            callback(result);
        });
    },

    getProduct: function (productKey) {
        return $.ajax({
            url: '/trainingstorefront/electronics/en/search/autocomplete/SearchBox',
            data: {
                term: productKey
            }
        });
    }


}

/*TODO
 - advanced select
 - warn user at console if something wrong immediately
 - simplify
*/


