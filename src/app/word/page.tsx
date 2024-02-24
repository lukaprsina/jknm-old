"use client"

import wordFilter from "tinymce-word-paste-filter"

export default function Word() {
    return <>
        <p><strong>Bela krajina</strong></p><p>Bela krajina je pretežno kraška pokrajina med Gorjanci, Poljansko goro ter mejno Kolpo in je najbolj jugovzhodna slovenska pokrajina. Njen osrednji del je nizek kraški ravnik v nadmorskih višinah od 150 do 200 m, ki ga gradijo pretežno kredni apnenci in dolomiti. Ozemlje seka več tektonskih prelomov. Za površje so značilne številne vrtače, manjše koliševke ter suhe doline. Na zakraselem ravniku prevladuje podzemeljsko odtekanje voda. V procesu zakrasevanja so podzemski tokovi ustvarili številne vodne jame (<a href="https://www.jknm.si/media/pdf/1796_Jelenja.pdf">Jelenja jama</a>, <a href="https://www.jknm.si/media/pdf/3341_Dzud.pdf">Džud</a>). V reliefu Bele krajine so izrazite skalne debri stalnih površinskih tokov (Lahinja, Krupa, Dobličica in največja med njimi Kolpa). V obalah rek se odpirajo številne, povečini vodne jame (<a href="https://www.jknm.si/media/pdf/1281_Kobiljaca.pdf">Kobiljača</a>, <a href="https://www.jknm.si/media/pdf/1803_Fuckovski.pdf">Fučkovski zdenec</a>, <span><a href="https://www.jknm.si/media/pdf/2950_Jama_v_kamnolomu.pdf">Jama v kamnolomu</a></span>). Na zahodnem robu Bele krajine se razmeroma strmo dvigujejo pobočja Poljanske gore, kjer so izvrstni pogoji za nastanek globokih w brezen (<a href="https://www.jknm.si/media/pdf/2852_Kascica.pdf">Kaščica</a>, <a href="https://www.jknm.si/media/pdf/1272_Zjot_Sebetih.pdf">Zjot v Sebetihu</a>, Njivina).</p><p> </p><p>Belokranjski ravnik pri Dobličah. Foto Andrej Hudoklin.</p><p><span> </span></p>
        <textarea
            onPaste={e => {
                for (const type of e.clipboardData.types) {
                    console.log("Paste event", type, { data: e.clipboardData.getData(type) })
                }
                if (e.clipboardData.types.includes("text/html")) {
                    const word = e.clipboardData.getData("text/html")
                    const filtered = wordFilter(word);
                    console.log({ word, filtered })
                }
            }}
        />
    </>
}