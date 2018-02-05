
module.exports = {
    read: readIni
}

parseIni = function (iniText) {

    var S_WAITKEY 	= 1
        , S_KEY 	= 2
        , S_VALUE 	= 3
        , S_SECTION = 4;

    function isspace(x) {
        return x.trim() === ''
    }

    function isnewline(x) {
        return {
                '\n': 1
            , '\r': 1
        }[x] === 1
    }

    var root 		= {}
        , curr 		= root
        , state 	= S_WAITKEY
        , i 		= 0
        , c_i		= 0
        , kbuff 	= ''
        , vbuff 	= ''
        , row 		= 0
        , col 		= 0
        , ctx 		= [];

    while (i < iniText.length) {
        // row col
        if (isnewline(iniText[i])) {
            row += 1;
            col = 0;
        } else {
            col += 1;
        }

        // Oneline comments
        if ((i + 1 < iniText.length) && iniText[i] == '/' && iniText[i + 1] == '/') {
            i += 2;
            while (i < iniText.length && !isnewline(iniText[i]))
                i++;
        }

        // Multiline comments
        if ((i + 1 < iniText.length) && iniText[i] == '/' && iniText[i + 1] == '*') {
            i += 2;;
            (function() {
                var depth = 1;
                while (i + 1 < iniText.length) {
                    if (iniText[i] == '*' && iniText[i + 1] == '/') {
                        depth -= 1;
                        if (depth == 0)
                            break;
                    }
                    if (iniText[i] == '/' && iniText[i + 1] == '*')
                        depth += 1;
                    i += 1;
                }
            })();
            i += 2;
        }

        if (state === S_WAITKEY) {
            if (i >= iniText.length)
                break;
            if (isspace(iniText[i]))
                i += 1;
            else if (iniText[i] == '}') {
                i += 1;
                if (ctx.length == 0)
                    throw [row, col, 'Possible parenthesis disbalance']
                var state_curr = ctx.pop()
                state = state_curr[0]; curr = state_curr[1];
            } else {
                state = S_KEY;
            }
        } else if (state === S_KEY) {
            if (isspace(iniText[i])) {
                curr[kbuff] = {};
                state = S_WAITKEY;
                ctx.push([state, curr])
                curr = curr[kbuff]
                kbuff = ''
                state = S_SECTION
            } else if (iniText[i] == ':') {
                state = S_VALUE;
            } else {
                kbuff += iniText[i];
            }
            i += 1
        } else if (state === S_VALUE) {
            if (isspace(iniText[i])) {
                curr[kbuff] = vbuff;
                kbuff = ''; vbuff = '';
                state = S_WAITKEY;
            } else if (iniText[i] == '}') {
                curr[kbuff] = vbuff;
                kbuff = ''; vbuff = '';
                if (ctx.length == 0)
                    throw [row, col, 'Possible parenthesis disbalance']
                var state_curr = ctx.pop()
                state = state_curr[0]; curr = state_curr[1];
            } else {
                vbuff += iniText[i];
            }
            i += 1
        } else if (state === S_SECTION) {
            if (iniText[i] == '{') {
                state = S_WAITKEY;
            } else if (!isspace(iniText[i])) {
                throw [row, col, iniText.slice(i-100, i+100)]
            }
            i += 1
        }
    }
    return root;
} 