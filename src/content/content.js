import debounce from 'lodash/debounce'

let allTextNodes = [];
let loadingNode = [];
let inViewNodes = [];
let appendsNodes = [];
let promtText =''
import { detecLang, generateUUID, istextNode, isElementNode, insertAfter } from './util'

if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {
                setTimeout(() => detecLang());
        });
}
const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
                if (entry.isIntersecting) {
                        let targetNode = entry.target;
                        if (!inViewNodes.find(s => s._$id === targetNode._$id) && targetNode._$translate === 'todo') {
                                inViewNodes.push(targetNode);
                                refreshTrans();
                        }
                }
        });
}, { threshold: 0.8 });

//只看在视图内的节点
const refreshTrans = debounce(() => {
        let peddingNode = inViewNodes.filter(s => s._$translate === 'todo').sort((a, b) => a._$sortIndex - b._$sortIndex);
        if (peddingNode.length === 0) {
                return
        }
        console.log('请求翻译的节点', peddingNode.map(s => s.textContent))
        chrome.runtime.sendMessage({
                action: "translateContent",
                promtText:promtText,
                text: peddingNode.map(node => {
                        node._$translate = 'doing';
                        const newNode = document.createElement('p')
                        newNode._$id = node._$id
                        newNode.classList.add('translate_loading')
                        newNode.style.opacity = 0.6;
                        insertAfter(newNode, node)
                        loadingNode.push(newNode)
                        return {
                                id: node._$id,
                                text: node.textContent,
                        }
                })
        }, () => {
                console.log('请求成功')
        })
}, 200)

function clearPreData() {
        inViewNodes = [];
        loadingNode.forEach(s => s.remove());
        appendsNodes.forEach(s => s.remove());
        loadingNode = [];
        appendsNodes = [];
        allTextNodes.forEach(node => {
                let id = generateUUID();
                node._$id = id;
                node._$translate = 'todo';
                observer.observe(node);
        })

        loadingNode = [];
}

// 收集所有节点，并观察
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        sendResponse({ sucess: true });
        if (message.action === 'translateRequest') {
                promtText = message.payload.promtText;
                if (allTextNodes.length > 0) {
                        clearPreData();
                } else {
                        gatherTextNodes(document.body).then(() => {
                                console.log('收集到的节点', allTextNodes.map(s => s.textContent))
                                allTextNodes.forEach((s, index) => {
                                        observer.observe(s)
                                        s._$sortIndex = index
                                })
                        })
                }

        }
        if (message.action === 'translateItemCompleted') {
                if (!message.payload) {
                        return true;
                }

                const { id, text } = message.payload;
                const node = allTextNodes.find(n => n._$id === id);
                if (node) {
                        node._$translate = 'done';
                        const newNode = node.cloneNode(true);
                        newNode.textContent = text;
                        newNode.style.opacity = 0.6;
                        insertAfter(newNode, node);
                        appendsNodes.push(newNode)
                        observer.unobserve(node);
                }
                const inNode = loadingNode.find(n => n._$id === id);
                console.log('翻译文本', text)

                if (inNode) {
                        inNode.remove()
                }
        }

        return true;
});

async function gatherTextNodes(element) {
        const childNodes = Array.from(element.childNodes);
        for (let node of childNodes) {
                if (istextNode(node)) {
                        // 去掉单一的
                        if (!node.textContent.trim().includes(" ")) {
                                continue;
                        }
                        let id = generateUUID();
                        node._$id = id;
                        node._$translate = 'todo'
                        allTextNodes.push(node)
                } else if (isElementNode(node)) {
                        await gatherTextNodes(node);
                }
        }
}























