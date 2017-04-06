<%@ page trimDirectiveWhitespaces="true"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="ycommerce" uri="http://hybris.com/tld/ycommercetags"%>

<c:url value="/search/" var="searchUrl" />
<c:url value="/search/autocomplete/${component.uid}"
	var="autocompleteUrl" />


<script id="bulkSearchTemplate" type="text/x-jquery-tmpl">
	<div class="js-site-search-bulk-mode__wrapper">
		<textarea class="js-site-search-bulk-mode__editor"></textarea>
		<div class="js-site-search-bulk-mode__result-area">
			<!-- bulkSearchProductListTemplate -->
		</div>
		<div class="js-site-search-bulk-mode__close-button">close</div>
	</div>
</script>

<script id="bulkSearchProductListTemplate" type="text/x-jquery-tmpl">

{{each(index, product) products}}
<div class="js-site-search-bulk-mode__product">
    {{if product.name}}
      {{if product.thumbnail != ''}}
         <img class="js-site-search-bulk-mode__product__image" src="{{= product.thumbnail}}"/>
      {{/if}}
      <span class="js-site-search-bulk-mode__product__name">
         {{= product.name}}
      </span>
      <span class="js-site-search-bulk-mode__product__price">
         {{if product.price && product.price.formattedValue}}
         {{= product.price.formattedValue}}
         {{/if}}
      </span>
      <button type="submit" data-code="{{= product.code}}" class="btn-primary js-add-to-cart btn-icon glyphicon-shopping-cart">
         +1
      </button>
   {{else}}
        <div class="multiple-result-available">
      {{if product && product[0] && product[1]}}
        {{= product.length}}&nbsp; options available
        <div class="options-list">
        {{each product}}
            <div class="multiple-result-option">
            {{if thumbnail}}
            <img class="js-site-search-bulk-mode__product__image" src="{{= thumbnail}}"/>
            {{/if}}
            {{= name}}
            <button class="select-this-option btn btn-info glyphicon glyphicon-ok-circle" title="Select this product" data-code="{{= code}}"></button>
            </div>
        {{/each}}
        </div>
        </div>
      {{else}}
        {{if productKey}}
          <span>Loading...</span>
        {{else}}
          <span></span>
        {{/if}}
      {{/if}}

   {{/if}}
    {{if product.name}}
      <div class="js-site-search-bulk-mode__product-details">

      <div class="js-site-search-bulk-mode__product-details__content">
      <div class="js-site-search-bulk-mode__product-details-header">
         {{if product.thumbnail}}
            <img class="js-site-search-bulk-mode__product__image-big" src="{{= product.thumbnail}}"/>
         {{/if}}
         <div>
            {{if product.url}}
               <a target="_blank" href="{{= product.url}}">{{= product.name}}</a>
            {{else}}
               {{= product.name}}
            {{/if}}
         </div>
         <div>
            {{if product.price && product.price.formattedValue}}
               {{= product.price.formattedValue}}
            {{/if}}
            {{= product.stock.stockLevelStatus.code}}
         </div>
      </div>
      {{= product.summary}}
      {{= product.description}}
      </div>
      </div>
   {{/if}}
</div>
{{/each}}

</script>

<div class="ui-front">
	<form name="search_form_${component.uid}" method="get"
		action="${searchUrl}">
		<div class="input-group">
			<spring:theme code="search.placeholder" var="searchPlaceholder" />

			<ycommerce:testId code="header_search_input">
				<input type="text" id="js-site-search-input"
					class="form-control js-site-search-input" name="text" value=""
                    maxlength="100" placeholder="${searchPlaceholder}"
					data-options='{"autocompleteUrl" : "${autocompleteUrl}","minCharactersBeforeRequest" : "${component.minCharactersBeforeRequest}","waitTimeBeforeRequest" : "${component.waitTimeBeforeRequest}","displayProductImages" : ${component.displayProductImages}}'>
			</ycommerce:testId>

			<span class="input-group-btn">
				<button class="js-site-search-bulk-mode">
					<span>\/</span>
				</button>

				<ycommerce:testId code="header_search_button">
					<button class="btn btn-link js_search_button" type="submit" disabled="true">
						<span class="glyphicon glyphicon-search"></span>
					</button>
				</ycommerce:testId>
			</span>
		</div>
	</form>

</div>
