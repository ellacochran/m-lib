.PHONY : all clean

all : m.js

clean :
	@rm -f m.src.js m.js src/*.js.cmt

%.js.cmt : %.js
	@echo "/* TOP OF FILE : $^ */" > $@
	@cat $^ >> $@
	@echo "/* END OF FILE : $^ */" >> $@
	@echo "" >> $@

m.src.js : modules.js $(addsuffix .cmt,$(shell ls src/*.js))
	@cat $^ > $@

m.js : m.src.js
	@cat $^ | jsminify > $@
