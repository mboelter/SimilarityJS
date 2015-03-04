SRC = src/vector.js \
	src/store.js \
	src/index.js \
	src/similarity.js \

all: similarity.js test

similarity.js: $(SRC)
	cat build/wrapper_start $^ build/wrapper_end > $@

clean:
	rm -f similarity{.min,}.js

test:
	npm test
.PHONY: test
