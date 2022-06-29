const parseChangelog = require('changelog-parser')
const showdown = require('showdown')
const fs = require('fs')
const Handlebars = require("handlebars");

Handlebars.registerHelper('isLogType', function (value) {
    return value !== "_";
});
Handlebars.registerHelper('greaterThan', function (key, versions) {
    return key + 1 !== versions.versions.length;
});
Handlebars.registerHelper('iconMap', function (value) {
    return {
        "Fixed": "🔨",
        "Added": "✅",
        "Changed": "📝",
        "Deprecated": "⚠️",
        "Security": "🔒",
        "Removed": "❌"
    }[value] || "🍻";
});
Handlebars.registerHelper('markdownToHtml', function (text) {
    text = text.replace('- ', '');
    let returnValue = new showdown.Converter().makeHtml(text);
    returnValue = returnValue.replace(/<p>/g, '').replace(/<\/p>/g, '\n');
    return returnValue
});

const handlebars_template = Handlebars.compile(`

<h3 class="text-xl text-md@md margin-bottom-sm padding-top-sm">{{title}}</h3>

<p class="text-sm margin-bottom-xl">
    {{{markdownToHtml description}}}
</p>
        
{{#each versions}}
    {{#if parsed._}}
        <article>
            <div class="grid gap-md items-start">
            <!-- metadata -->
            <div class="changelog__metadata col-4@md">
                <h2 class="text-xl text-md@md">
                {{#if version}}
                    v{{version}}
                {{else}}
                    Unreleased
                {{/if}}
                </h2>
                <time class="text-sm color-contrast-medium" datetime="{{date}}">
                    {{date}}
                </time>
            </div>
    
            <!-- content -->
            <div class="col-8@md">
                <div class="grid gap-lg">
               
                    <!-- logs -->
                    {{#each parsed as |logs logType|}}
                        {{#if (isLogType logType)}}
                            <div>
                                <h3 class="text-md margin-bottom-sm">{{logType}}</h3>
                                <ul class="list list--icons">
                                    {{#each logs}}
                                        <li>
                                            <div class="flex items-start">
                                                <div>{{iconMap @logType}} {{{markdownToHtml this}}}</div>
                                            </div>
                                        </li>
                                    {{/each}}
                                </ul>
                            </div>
                        {{/if}}
                    {{/each}}
                  
                </div>
            </div>
        </div>
        </article>
        {{#if (greaterThan @key ..this)}}
            <div class="changelog__separator" role="presentation"></div>
        {{/if}}
    {{/if}}
    
{{/each}}
`);

const previewChangelog = ({changelogPath, buildPath}) => {
    const changelogData = parseChangelog(changelogPath);
    changelogData.then(changelog => {
        let changelogHtml = handlebars_template(changelog);

        // create build folder and move css folder to build folder
        fs.mkdir(buildPath, {recursive: true}, (err) => {
            if (err) throw err;
            const files = fs.readdirSync(`${__dirname}/css`);
            files.forEach(file => {
                fs.copyFile(`${__dirname}/css/${file}`, `${buildPath}/${file}`, (err) => {
                    if (err) throw err;
                });
            });
        });

        fs.readFile('index.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            data = data.replaceAll('css/', '');
            data = data.replace('[title]', changelog['title']);
            let result = data.replace(/<div id="changelog">[\s\S]*<\/div>/, '<div id="changelog">' + changelogHtml + '</div>');
            fs.writeFile(`${buildPath}/index.html`, result, 'utf8', function (err) {
                if (err) return console.log(err);
                console.log('changelog updated');
            });
        });
    })

}

module.exports = {previewChangelog};
