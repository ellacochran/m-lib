.PHONY : all clean

all : m.js

clean :
	@rm -f m.src.js m.js src/*.js.cmt

dist : m.js
	@rm -f src/*.js.cmt

%.js.cmt : %.js
	@echo "/* TOP OF FILE : $^ */" > $@
	@cat $^ >> $@
	@echo "/* END OF FILE : $^ */" >> $@
	@echo "" >> $@

m.src.js : modules.js $(addsuffix .cmt,$(shell ls src/*.js))
	@echo "/*" > $@
	@cat LICENSE >> $@
	@echo "*/" >> $@
	@cat $^ >> $@

m.js : m.src.js
	@echo "/* For licensing information go to https://github.com/ellacochran/m-lib */" > $@
	@cat $^ | jsminify >> $@
