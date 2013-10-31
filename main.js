/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
 	"use strict";
	require(["third_party/typescriptServices", "third_party/minimatch", "text!third_party/lib.d.ts"],  
            function (typescript, minimatch, defaultLib){
                window.TypeScriptDefaultLibraryContent = defaultLib;
                require(["bin/main/index"],  function (init){
                    init();
                })
	       }
   );
});