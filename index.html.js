let $pairs;
let $content;
let $contentContainer;

window.addEventListener('DOMContentLoaded', () => {
    $pairs = document.getElementById('pairs');
    $content = document.getElementById('content');
    $contentContainer = document.getElementById('content-container');

    if(localStorage.content) {
        $content.value = localStorage.content;
    }

    if(localStorage.pairs) {
        $pairs.value = localStorage.pairs;
    }
});

const convertPairsToJSON = (pairs) => {
    pairs = `"${pairs}`;
    pairs = pairs.replace(/\n/g, '\n"');
    pairs = pairs.replace(/\:|=/g, '":');
    pairs = pairs.replace(/\: ?(.*)\n*/g, ': "$1",\n');
    pairs = `{${pairs}}`;
    pairs = pairs.replace(/,\n*}/g, '}');
    return JSON.parse(pairs);
};

const getKeysFromContent = () => {
    const keysExpr = /<.*?>/g;
    const matches = $content.value.match(keysExpr);
    const keys = [...new Set(matches)];
    $pairs.value = keys.join(' = \n') + ' = ';
};

const renderLines = (content) => {
    const lines = content.split('\n');
    
    $contentContainer.innerHTML = '';

    const commentExpr = /\/\/\s/;
    const warningExpr = /\/\/\!\!/;

    lines.forEach(line => {
        let isNotEmpty = line.length > 0;
        let isCommentLine = commentExpr.test(line);
        let isWarningLine = warningExpr.test(line);

        let tagClassName = isWarningLine ? 'is-warning' : 'is-info';
        let markup = '';

        if(isCommentLine || isWarningLine) {
            let tagText = line.replace(commentExpr, '').replace(warningExpr, '');
            markup = `<span class="tag is-normal ${tagClassName}" style="margin-top:10px;">${tagText}</span>`;
        } else if(isNotEmpty) {
            markup = `<input type="text" class="input" onfocus="this.select();" value="${line}">`;
        }

        $contentContainer.innerHTML += markup;
    });
};

const replaceKeysWithValues = (pairs, content) => {
    let keyValuePairs = convertPairsToJSON(pairs);
    let keys = Object.keys(keyValuePairs);

    
    keys.forEach((key) => {
        content = content.replace(new RegExp(`${key.trim()}`, 'g'), keyValuePairs[key].trim());
    });
    
    return content;
};

const convertMultilineCommandsToOneLine = (content) => {
    return content.replace(/\\\n\s*/g, ' ');
};

const updateUI = () => {
    let pairs = $pairs.value;
    let content = $content.value;
    
    if(pairs.length > 0 && content.length > 0) {
        content = convertMultilineCommandsToOneLine(content);
        content = replaceKeysWithValues(pairs, content);
        renderLines(content);
    }

    localStorage.pairs = $pairs.value;
    localStorage.content = $content.value;
};