// import CryptoJS from 'crypto-js';
import { TTSRecorder } from './SparkConnect';

chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent" && request.text) {
                chrome?.storage?.sync?.get(['spark_appId', 'spark_apiSecret', 'spark_apiKey'], (sparkConfig) => {
                        if (sparkConfig) {
                                translateText(request.text, sparkConfig, request.promtText)
                        }
                });
                console.log('background翻译', request.text)

                return true; // Indicates an asynchronous response is expected
        }
        sendResponse()
});

function retry(count, payload) {
        if (count > 0) {
                setTimeout(() => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                console.log('重试次数', count)
                                if (!tabs[0]) {

                                        retry(count - 1, payload);
                                        return
                                }
                                chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: payload }, () => {
                                        console.log('翻译成功23', JSON.parse(res))
                                });
                        })
                }, 100)

        }

}
async function translateText(textArray, sparkConfig, promtText) {
        if (!textArray || textArray.length === 0) {
                return
        }
        try {
                let WebConnect = new TTSRecorder(sparkConfig);
                let allRes = []
                WebConnect.onEnd = () => {
                        WebConnect.setStatus('close')
                }

                WebConnect.onResult = (res) => {
                        try {
                                let payload = JSON.parse(res)
                                console.log('翻译成功23', JSON.parse(res));
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                        tabs[0] && chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: payload }, () => {

                                        });
                                })
                        } catch  {

                        }

                }
                WebConnect.onOpen = () => {
                        if (textArray.length > 0) {
                                WebConnect.webSocketSend(textArray, promtText);
                        }
                }
                WebConnect.start()


        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
