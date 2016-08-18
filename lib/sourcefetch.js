'use babel';

import { CompositeDisposable } from 'atom'
import request from 'request'
import cheerio from 'cheerio'

export default {

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sourcefetch:fetch': () => this.fetch()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  fetch() {
    let editor
    let self = this

    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      this.download(selection).then((html) => {
        let answer = self.scrape(html)
        if (answer === '') {
          atom.notifications.addWarning('No answer found :(')
        } else {
          editor.insertText(answer)
        }
      }).catch((error) => {
        console.log(error)
        atom.notifications.addWarning(error.reason)
      })
    }
  },

  scrape(html) {
    $ = cheerio.load(html)
    return $('div.accepted-answer pre code').text()
  },

  download(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Unable to download page'
          })
        }
      })
    })
  }
};
