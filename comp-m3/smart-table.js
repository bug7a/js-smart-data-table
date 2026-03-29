/* Bismillah */

/*

SmartTable- v25.07 - "Optimized for big data"

- SmartTable is a JavaScript table component designed to run smoothly even with millions of records. Thanks to its virtual scroll architecture, it only writes the visible rows to the DOM, eliminating memory and performance issues with large datasets. It makes data exploration easy with real-time filtering, multi-column sorting, and both horizontal and vertical scroll support. Custom cell designs can be created for each column via createCustomItemCell, allowing flexible visual content per column. Since column widths, heights, and colors are all configurable through parameters, it can be quickly adapted to different projects.


Started Date: Mar 2026
Developer: Bugra Ozden
Email: bugra.ozden@gmail.com
Webpage: https://bug7a.github.io/js-components/


- style değerlerini ekle
- eğer yüksekli değişirse, itemcell yüksekliği hesaplanıp değişsin. Eğer itemCell değişirse height auto olsun.
- filter da bir title seçilebilmeli, default: ALL olsun.
- Eğer itemHeight 20px den küçük ise otomatik itemLineCount düşür ve eğer itemHeight büyükse 100px den itemLineCount arttır.
- sort yaparken, arama yaparken (waitAndRun ekle) bir yüklenme görünsün çünkü 1milyon kayıtta bu işlem zaman alıyor.

*/

"use strict";

// Default values:
const SmartTableDefaults = {
    key: "0",
    titleHeight: 50,
    itemHeight: 40,
    infoHeight: 50,
    itemLineCount: 16,
    highlightTitle: true,
    highlightLine: true,
    invertColor: 0,
    noDataFoundAlert: "No data found!",
    searchKeyword: "",
    sortByTitleIndex: 0,
    sortDirection: "A-Z", // "A-Z" or "Z-A"
    verticalScrollWidth: 20,
    verticalScrollMargin: 2,
    fillTestData: 0,
    onSelect: function (itemData) { },
    createCustomItemCell: function (cell, titleDataIndex) { return cell },
    updateCustomItemCell: function (cell, titleDataIndex, data) { },
    titleDataList: [
        { name: "ID", dataTitle: "id", dataType: "integer", width: 100, shortable: 1 },
        { name: "NAME", dataTitle: "name", dataType: "string", width: 100, shortable: 1 },
        { name: "EMAIL", dataTitle: "email", dataType: "string", width: 290, shortable: 0 },
        { name: "", dataTitle: "active", dataType: "boolean", width: 40, shortable: 0 },
    ],
    itemDataList: [
        { id: 1, name: "Bugra", desc: "about", email: "emainil", active: 1 },
        { id: 2, name: "Alper", desc: "about", email: "emainil", active: 1 },
        { id: 3, name: "Murat", desc: "about", email: "emainil-3", active: 1 },
        { id: 4, name: "Deniz", desc: "about", email: "emainil", active: 1 },
        { id: 5, name: "Nilüfer", desc: "about", email: "emainil-7", active: 1 },
        { id: 6, name: "Frank", desc: "about", email: "emainil", active: 1 },
        { id: 7, name: "Dany", desc: "about", email: "emainil-45", active: 1 },
        { id: 8, name: "Duygu", desc: "about", email: "emainil", active: 1 },
        { id: 9, name: "Filiz", desc: "about", email: "emainil-356", active: 1 },
        { id: 10, name: "Anka", desc: "about", email: "emainil", active: 1 },
    ],
    scrollBarParams: {
        bar_border: 0,
        bar_round: 3,
        bar_borderColor: "rgba(0, 0, 0, 1)",
        bar_width: 4,
        bar_mouseOverWidth: 4, //8
        bar_mouseOverColor: "#373836",
        bar_opacity: 0.4,
        bar_mouseOverOpacity: 0.9,
        bar_padding: 2,
        bar_color: "#373836",
        neverHide: 0,
        showDots: 0,
    },
    style: {
        width: "100%", height: "100%", round: 6, highlightItemCellColor: "#F3E7C2", highlightTitleCellColor: White(0.2),
        box: {},
        boxBorder: { color: "transparent", border: 2, borderColor: Black(0.8) },
        boxTitleLine: {},
        boxTitleCell: {},
        lblTitleCell: {},
        boxItemLine: {},
        boxItemCell: {},
        lblItemCell: {},
        boxInfoLine: { color: "#E4E4E4", },
        lblNoDataFound: { color: "lightgray", padding: [8, 2], fontSize: 14, round: 8, border: 1, borderColor: Black(0.4), },
    },
};

const SmartTable = function (params = {}) {

    // Marge params:
    mergeIntoIfMissing(params, SmartTableDefaults);

    /*
    // Yükseklik otomatik değil ise, ItemCell yüksekliğini otomatik hesapla.
    if (params.height != "auto") {
        params.recalcItemHeight = true;
    } else {
        params.recalcItemHeight = false;
    }

    // Eğer genişlik tam olacak ise, scroll için boş alan ekle.
    if (params.width == "100%") {
        params.width = "calc(100% - 22px)";
    }
    */

    // BOX: Component container
    let box = startObject(params);

    /*
    // Item yüksekliği otomatik hesaplanacak.
    if (box.recalcItemHeight) {
        box.itemHeight = (box.height - box.titleHeight - box.infoHeight) / box.itemLineCount;
    }
    */

    // NOTE: Parent container is box.containerBox

    // *** PUBLIC VARIABLES:
    // State of component [var]
    box.state = "normal";
    // Created items by data [var]
    box.visibleItemDataList = [...box.itemDataList];
    // [var]
    box.itemLineList = [];
    // [var]
    box.titleCellList = [];
    // [var]
    box.titleCellCount = 0;
    // [var]
    box.startedItemIndexForScrolling = 0;
    // Scroll haraketi için gerekli değişkenler [var]
    box.scrollVars = {};
    // [var] if height not auto will recallItemHeight
    box.recalcItemHeight = 0;
    // [var]
    box.resizeTimer = null;
    box.filterTimer = null;

    // *** PUBLIC FUNCTIONS:

    // setView
    box.setState = function (state) {

        box.state = state;

        switch (state) {

            case "normal":
                //box.background.color = box.backgroundStyle.color;
                //box.lblBadget.color = badgetCurrentColor;
                //box.background.border = 1;
                break;

            case "mouseover":
                //box.background.color = box.backgroundStyle.overColor;
                //box.lblBadget.color = "white";
                //box.background.border = 3;
                break;

            case "selected":

                break;

            case "disabled":

                break;

        }
    };

    const refresh = function () {
        // refresh code
    };

    box.refresh = function (time = 3) {

        // NOTE: Check the child objects and make sure their states are appropriate.
        if (box.refreshTimeout) clearTimeout(box.refreshTimeout);

        box.refreshTimeout = setTimeout(refresh, time);

    };

    // box.superRemove = box.remove;
    box.destroy = function () {

        //page.remove_onResize(functionName); // on page resized.

        // Remove basic objects
        //box.background.remove(); // NOTE: If you add event (box.background.on("click") to other objects.
        //box.icon.remove();

        // box.superRemove.call(box);
        box.remove(); // NOTE: It will clean all events like box.on("click"
        box = null;

    };

    box.refreshData = function () {

        const _startIndex = box.startedItemIndexForScrolling;
        const _dataList = box.visibleItemDataList;
        const _titleDataList = box.titleDataList;
        const _titleCount = box.titleCellCount;
        const _lineCount = box.itemLineCount;

        // Sadece ekranda görünen satır sayısı kadar dönüyoruz
        for (let i = 0; i < _lineCount; i++) {

            const _itemLine = box.itemLineList[i];
            const _dataIndex = _startIndex + i;
            const _rowData = _dataList[_dataIndex];

            // Eğer veri varsa satırı güncelle, yoksa temizle/gizle
            if (_rowData) {
                _itemLine.opacity = 1; // Veya opacity: 1
                //_itemLine.visible = 1;
                for (let j = 0; j < _titleCount; j++) {

                    const titleData = _titleDataList[j];
                    const cell = _itemLine["itemCell" + j];
                    const newValue = _rowData[titleData.dataTitle] ?? "";

                    // PERFORMANCE HACK: Sadece değer değişmişse DOM'a dokun
                    if (cell.label.text !== newValue) {
                        cell.label.text = newValue;
                    }

                    box.updateCustomItemCell(cell, j, newValue);

                }
            } else {
                // Veri bitmişse satırı boş göster veya gizle
                _itemLine.opacity = 0;
                //_itemLine.visible = 0;
            }
        }

        if (_dataList.length > _lineCount) {
            // Scroll buttonlarını göster.
            box.setVerticalScrollEnabled(true);

        } else {
            // Scroll butonlarını gizle.
            box.setVerticalScrollEnabled(false);
        }

        box.updateInfoLabel();

    };

    box.setVerticalScrollEnabled = function (enabled) {

        // Sadece kullanılabilir durumda ise enabled yapılabilir.
        if (enabled && box.visibleItemDataList.length > box.itemLineCount) {
            // Scroll buttonlarını göster.
            box.icoScroll.opacity = 1;
            box.icoScroll.clickable = 1;
            box.btnUp.opacity = 1;
            box.btnUp.clickable = 1;
            box.btnDown.opacity = 1;
            box.btnDown.clickable = 1;

        } else {
            // Scroll butonlarını gizle.
            box.icoScroll.opacity = 0;
            box.icoScroll.clickable = 0;
            box.btnUp.opacity = 0.5;
            box.btnUp.clickable = 0;
            box.btnDown.opacity = 0.5;
            box.btnDown.clickable = 0;
        }

    }

    box.setTitleCellWidth = function (titleCellIndex, width) {

        if (titleCellIndex < 0 || titleCellIndex >= box.titleCellCount) return;

        box.titleCellList[titleCellIndex].width = width;
        box.titleDataList[titleCellIndex].width = width;

        box.itemLineList.forEach(function (itemLine) {
            itemLine["itemCell" + titleCellIndex].width = width;
        });

    }

    // Başlık listesini oluştur
    box.createTitleLine = function () {

        box.titleCellList = [];
        box.boxTitleLine.html = "";

        // titleDataList
        box.titleDataList.forEach(function (titleData, titleCellIndex) {
            const titleCell = box.createTitleCell(titleData, titleCellIndex);

            box.titleCellList.push(titleCell);
            box.boxTitleLine.add(titleCell);
        });

        box.titleCellCount = box.titleCellList.length;

    };

    box.createSortIcon = function (cell) {

        startBox({
            align: "right center",
            color: "#65A293", // "#65A293",
            round: 100,
            border: 1,
            borderColor: "rgba(0,0,0,0.1)",
            width: 22,
            height: 22,
            right: 2,
            padding: [4, 0],
            position: "absolute",
            top: 15,
        });
        if (cell.shortable == 0) that.opacity = 0;
        cell.add(that);

        cell.icon = Icon({
            width: 20,
            height: 20,
            left: 0,
            top: 0,
            opacity: 0.5,
        });
        that.setMotion("opacity 0.3s, transform 0.3s");
        that.load("../comp-m3/smart-table/sort.png");

        endBox();

    };

    box.resetSortIcons = function (self) {

        box.titleCellList.forEach(function (titleCell, titleCellIndex) {
            if (titleCellIndex != self.titleCellIndex) {
                titleCell.icon.rotate = 0;
                titleCell.icon.opacity = 0.5;
                titleCell.sortDirection = "";
            }
        });

    };

    // Başlık hücresi oluştur
    box.createTitleCell = function (titleData, titleCellIndex) {

        // TitleCell
        const cell = AutoLayout({
            flow: "horizontal",
            align: "center left",
            width: titleData.width || 100,
            padding: [8, 0],
            height: box.titleHeight,
            color: "transparent",
            border: 0,
            position: "relative",
        });
        that.titleCellIndex = titleCellIndex;
        that.titleDataTitle = titleData.dataTitle;
        that.shortable = titleData.shortable;
        that.elem.style.borderRight = "1px solid rgba(0, 0, 0, 0.5)";
        that.elem.style.borderBottom = "2px solid #141414";
        that.elem.style.fontFamily = "opensans-bold";
        that.elem.style.cursor = "pointer";

        cell.label = Label({
            text: titleData.name,
        });

        endAutoLayout();

        box.createSortIcon(cell);

        cell.on("click", function (self, event) {

            if (self.shortable == 1) {

                // Clear All
                // box.resetSortIcons(self);
                box.titleCellList.forEach(function (titleCell, titleCellIndex) {
                    if (titleCellIndex != self.titleCellIndex) {
                        titleCell.icon.rotate = 0;
                        titleCell.icon.opacity = 0.5;
                        titleCell.sortDirection = "";
                    }
                });

                box.sortByTitleIndex = self.titleCellIndex;
                if (self.sortDirection != "A-Z") {
                    box.sortDirection = "A-Z";
                    cell.icon.rotate = 0;

                } else {
                    box.sortDirection = "Z-A";
                    cell.icon.rotate = 180;

                }
                cell.icon.opacity = 1;
                self.sortDirection = box.sortDirection;

                box.filterAndSortData();

            }

        });

        cell.on("mouseover", function (self, event) {
            box.applyColumnHighlight(self);
        });

        cell.on("mouseout", function (self, event) {
            box.clearColumnHighlight(self);
        });

        return cell;

    };

    box.clearColumnHighlight = function (titleCell) {

        if (box.highlightTitle) {
            titleCell.color = "transparent";
            box.itemLineList.forEach(function (itemLine, itemLineIndex) {
                itemLine["itemCell" + titleCell.titleCellIndex].color = "transparent";
            });
        }

    };

    box.applyColumnHighlight = function (titleCell) {

        if (box.highlightTitle) {
            titleCell.color = box.style.highlightTitleCellColor;
            box.itemLineList.forEach(function (itemLine, itemLineIndex) {
                itemLine["itemCell" + titleCell.titleCellIndex].color = box.style.highlightItemCellColor;
            });
        }

    };

    // Tüm bilgi satırlarını oluştur.
    box.createItemLines = function () {

        box.itemLineList = [];
        box.boxItemLineGroup.html = "";

        for (let i = 0; i < box.itemLineCount; i++) {
            const itemLineIndex = i;
            const itemLine = box.createItemLine(box.itemDataList[i], itemLineIndex);

            box.itemLineList.push(itemLine);
            box.boxItemLineGroup.add(itemLine);
        }

    }

    // Bir bilgi satırı oluştur
    box.createItemLine = function (itemData, itemLineIndex) {

        // ItemLine
        const itemLine = HGroup({
            height: box.itemHeight || 100,
            width: "auto",
            align: "top left",
            padding: [0, 0],
            gap: 0,
            color: (itemLineIndex % 2) ? "whitesmoke" : "white",
            position: "relative",
            //opacity: 0.5,
            // NOTE: this width, height: "100%" as default.
        });

        box.titleDataList.forEach(function (titleData, titleDataIndex) {
            // Item Cell
            itemLine["itemCell" + titleDataIndex] = box.createItemCell(titleData.width, titleDataIndex, itemLine);
        });

        endGroup();

        itemLine.on("click", function () {
            box.onSelect(itemData);
        });

        itemLine.visible = 0; // WHY: Yüksekli yeniden hesaplanması gerekirse, ekranda kırpma yapması için gizli oluşturuluyor.
        return itemLine;

    };

    // Hücre oluştur.
    box.createItemCell = function (cellWidth, titleDataIndex, itemLine) {

        // ItemCell
        let itemCell = AutoLayout({
            align: "center left",
            width: cellWidth || 100,
            padding: [8, 0],
            height: "100%",
            color: "transparent",
            border: 0,
        });
        that.elem.style.borderBottom = "1px solid darkgray";
        that.elem.style.borderRight = "1px solid rgba(0, 0, 0, 0.05)";
        that.elem.style.cursor = "pointer";

        itemCell.label = Label({
            text: "",
        });
        that.elem.style.whiteSpace = "nowrap";
        that.elem.style.textOverflow = "ellipsis";

        endAutoLayout();

        // Highlight vertical
        itemCell.on("mouseover", function (self, event) {
            if (box.highlightLine) {
                for (let i = 0; i < box.titleCellCount; i++) {
                    itemLine["itemCell" + i].color = box.style.highlightItemCellColor;
                }
            }
        });

        // Clean highlight vertical
        itemCell.on("mouseout", function (self, event) {
            if (box.highlightLine) {
                for (let i = 0; i < box.titleCellCount; i++) {
                    itemLine["itemCell" + i].color = "transparent";
                }
            }
        });

        itemCell = box.createCustomItemCell(itemCell, titleDataIndex);

        return itemCell;

    };

    // RIGHT Scroll
    box.initScrollMetrics = function () {

        // Değişkenler
        box.scrollVars.minY = box.titleHeight;
        box.scrollVars.scrollAreaHeight = box.height - box.titleHeight - box.infoHeight;
        box.scrollVars.scrollIconHeight = box.icoScroll.height;
        box.scrollVars.maxY = box.scrollVars.minY + box.scrollVars.scrollAreaHeight - box.scrollVars.scrollIconHeight;
        box.scrollVars.totalPath = box.scrollVars.maxY - box.scrollVars.minY;

        box.scrollVars.isDragging = false;
        box.scrollVars.startY = 0;
        box.scrollVars.startTop = 0;

    };

    box.syncScrollPosition = function () {

        const dataLength = box.visibleItemDataList.length;
        const maxScrollIndex = Math.max(0, dataLength - box.itemLineCount);

        if (maxScrollIndex === 0) return;

        const percent = box.startedItemIndexForScrolling / maxScrollIndex;
        box.icoScroll.top = box.scrollVars.minY + (percent * box.scrollVars.totalPath);

    };

    box.createScrollEvents = function () {

        // Sürükleme ayarları
        box.icoScroll.clickable = 1;
        box.icoScroll.elem.setAttribute("draggable", "false");
        box.icoScroll.elem.style.cursor = "grab";

        // Değişkenler
        box.initScrollMetrics();

        // 1. MOUSE WHEEL DESTEĞİ (Her kaydı görmeyi sağlar)
        box.on("wheel", function (self, event) {

            // ÖNEMLİ: Eğer yatayda bir hareket varsa (deltaX), 
            // dikey scroll kodunu çalıştırma ve tarayıcının yatay kaydırmasına izin ver.
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                return; // Fonksiyondan çık, preventDefault çalışma-sın.
            }

            // Sadece dikey hareket baskınsa dikey scrollu yönet ve sayfa kaymasını engelle
            event.preventDefault();

            const dataLength = box.visibleItemDataList.length;
            const maxScrollIndex = Math.max(0, dataLength - box.itemLineCount);

            // Tekerlek yönüne göre 1'er 1'er veya 3'er 3'er kaydır
            const step = event.deltaY > 0 ? 1 : -1;
            let newIndex = box.startedItemIndexForScrolling + step;

            if (newIndex < 0) newIndex = 0;
            if (newIndex > maxScrollIndex) newIndex = maxScrollIndex;

            if (newIndex !== box.startedItemIndexForScrolling) {
                box.startedItemIndexForScrolling = newIndex;
                box.syncScrollPosition(); // İkonu yeni indekse taşı
                box.refreshData();

            }
        }, { passive: false });

        // 2. MOUSE DRAG (Sürükleme)
        box.icoScroll.on("mousedown", function (self, event) {

            box.scrollVars.isDragging = true;
            box.scrollVars.startY = event.clientY;
            box.scrollVars.startTop = box.icoScroll.top;
            box.icoScroll.elem.style.cursor = "grabbing";
            document.body.style.userSelect = "none";

        });

        window.addEventListener("mousemove", function (event) {

            if (!box.scrollVars.isDragging) return;

            const diffY = event.clientY - box.scrollVars.startY;
            let newTop = box.scrollVars.startTop + diffY;

            if (newTop < box.scrollVars.minY) newTop = box.scrollVars.minY;
            if (newTop > box.scrollVars.maxY) newTop = box.scrollVars.maxY;

            box.icoScroll.top = newTop;

            const currentProgress = (newTop - box.scrollVars.minY) / box.scrollVars.totalPath;
            const dataLength = box.visibleItemDataList.length;
            const maxScrollIndex = Math.max(0, dataLength - box.itemLineCount);

            const newIndex = Math.round(currentProgress * maxScrollIndex);

            if (newIndex !== box.startedItemIndexForScrolling) {
                box.startedItemIndexForScrolling = newIndex;
                box.refreshData();
            }

        });

        window.addEventListener("mouseup", function () {

            if (box.scrollVars.isDragging) {
                box.scrollVars.isDragging = false;
                box.icoScroll.elem.style.cursor = "grab";
                document.body.style.userSelect = "auto";
            }

        });

    };

    box.scrollPage = function (direction) { // +1 ise aşağı (bir sayfa boyu), -1 ise yukarı
        const dataLength = box.visibleItemDataList.length;
        const maxScrollIndex = Math.max(0, dataLength - box.itemLineCount);

        // Yön +1 ise aşağı (bir sayfa boyu), -1 ise yukarı
        let newIndex = box.startedItemIndexForScrolling + (direction * box.itemLineCount);

        // Sınırları kontrol et
        if (newIndex < 0) newIndex = 0;
        if (newIndex > maxScrollIndex) newIndex = maxScrollIndex;

        // Eğer indeks değiştiyse güncelle
        if (newIndex !== box.startedItemIndexForScrolling) {
            box.startedItemIndexForScrolling = newIndex;

            // 1. Veriyi tazele
            box.refreshData();
            // 2. Scroll ikonunun yerini güncelle (Görsel senkronizasyon)
            box.syncScrollPosition();
        }
    };

    box.updateInfoLabel = function () {

        const totalData = box.visibleItemDataList.length;

        if (totalData === 0) {
            box.boxInfoLine.label.text = "0 - 0 / 0";
            box.lblNoDataFound.opacity = 1;
            // TODO: Show a alert text at center (No data!)
            return;
        }

        box.lblNoDataFound.opacity = 0;

        // Başlangıç indeksi (İnsanların okuması için +1 ekliyoruz, 0 yerine 1'den başlasın)
        const start = box.startedItemIndexForScrolling + 1;

        // Bitiş indeksi (Ya sayfa sonu ya da toplam veri miktarı)
        let end = box.startedItemIndexForScrolling + box.itemLineCount;
        if (end > totalData) end = totalData;

        // Sayıları binlik ayırıcı ile formatlamak (12499 -> 12.499)
        const format = (num) => num.toLocaleString('tr-TR');

        box.boxInfoLine.label.text = `${format(start)} - ${format(end)} / ${format(totalData)}`;

    };

    box.setScrollToTop = function () {
        box.startedItemIndexForScrolling = 0;
        box.icoScroll.top = box.scrollVars.minY;
    };

    box.setItemDataList = function (itemDataList) {
        box.itemDataList = itemDataList;
        box.filterAndSortData();
    };

    box.filterAndSortData = function () {

        if (box.itemDataList.length > 1000) box.showLoading(1);

        setTimeout(function () {

            const searchKeyword = box.searchKeyword.toLowerCase().trim();
            const sortByTitleIndex = box.sortByTitleIndex;
            const sortDirection = box.sortDirection; // "A-Z" or "Z-A"

            // 1. ADIM: FİLTRELEME (SEARCH)
            let filteredList = [...box.itemDataList];

            if (searchKeyword !== "") {
                filteredList = filteredList.filter(item => {
                    // Satırdaki tüm sütunlarda ara (veya sadece belirli başlıklarda)
                    return box.titleDataList.some(title => {
                        const val = item[title.dataTitle];
                        return val ? String(val).toLowerCase().includes(searchKeyword) : false;
                    });
                });
            }

            // 2. ADIM: SIRALAMA (SORTING)
            const titleData = box.titleDataList[sortByTitleIndex];
            if (titleData && titleData.shortable !== 0) {
                const key = titleData.dataTitle;

                filteredList.sort((a, b) => {
                    let valA = a[key] ?? "";
                    let valB = b[key] ?? "";

                    // Eğer sayısal veriyse ona göre karşılaştır
                    const isNumeric = !isNaN(valA) && !isNaN(valB) && typeof valA !== "boolean";

                    let comparison = 0;
                    if (isNumeric) {
                        comparison = parseFloat(valA) - parseFloat(valB);
                    } else {
                        comparison = String(valA).localeCompare(String(valB), 'tr');
                    }

                    return sortDirection === "A-Z" ? comparison : -comparison;
                });
            }

            // 3. ADIM: SONUCU YAZ VE RESETLE
            box.visibleItemDataList = filteredList;

            box.setScrollToTop();
            box.refreshData();
            //box.updateInfoLabel(); // Toplam sayı değiştiği için bilgiyi tazele

            box.showLoading(0);

        }, 50);

    };

    box.generateTestData = function () {

        // Test için veriyi 1000 katına çıkaralım:
        const repeatCount = 100000;
        let bigData = [];

        for (let i = 0; i < repeatCount; i++) {
            // Nesneleri klonlayarak ekliyoruz ki ID'leri çakışmasın veya referans karışmasın
            const clonedBatch = box.itemDataList.map(item => ({
                ...item,
                id: bigData.length + item.id // Benzersiz ID oluşturmak için
            }));

            bigData.push(...clonedBatch);
        }

        box.itemDataList = bigData;
        box.visibleItemDataList = bigData;

        console.log("Yeni veri sayısı:", box.visibleItemDataList.length);

    };

    box.createVerticalScroll = function () {

        box.icoScroll = startBox(0, 0, 20, 50);
        that.color = "white";
        that.round = 100;
        that.borderColor = "rgba(0,0,0,0.4)"
        that.border = 1;
        that.opacity = 0;
        that.clickable = 0;
        //that.color = "transparent";
        that.right = (box.icoScroll.width * -1) - 2;
        that.top = box.titleHeight;
        Icon(0, 0, "100%", "100%");
        that.load("../comp-m3/smart-table/scroll.png");
        endBox();

        box.btnUp = Box(0, 0, 20, box.titleHeight);
        that.right = -22;
        that.color = "lightgray";
        that.round = 100;
        that.border = 1;
        that.elem.style.cursor = "pointer";
        that.on("click", function (self, event) {
            box.scrollPage(-1);
        });
        Icon(0, 0, "100%", "100%");
        box.btnUp.add(that);
        that.load("../comp-m3/smart-table/up.png");

        box.btnDown = Box(0, 0, 20, box.infoHeight);
        that.right = -22;
        that.bottom = 0;
        that.color = "lightgray";
        that.round = 100;
        that.border = 1;
        that.elem.style.cursor = "pointer";
        that.on("click", function (self, event) {
            box.scrollPage(1);
        });
        Icon(0, 0, "100%", "100%");
        box.btnDown.add(that);
        that.load("../comp-m3/smart-table/down.png");

    };

    box.createToolbar = function () {

        HGroup({
            align: "left center",
            padding: [8, 0],
        });
        box.boxInfoLine.add(that);

        SearchInput({
            width: "50%",
            height: 36,
            border: 1,
            round: 8,
            color: "white",
            searchIconSize: 16,
            placeholderText: "Filter",
            fontSize: 16,
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderBottomStyle: "1px solid rgba(0, 0, 0, 0.4)",
            searchIconFile: "../comp-m2/search-input-v2/filter.png",
        });
        that.setText(box.searchKeyword);
        that.onSubmit = function (searchedText, self) {
            box.searchKeyword = searchedText;
            box.filterAndSortData();
            //box.filterTimer = waitAndRun(box.filterTimer, box.filterAndSortData, 1000);
        }

        endGroup();

        HGroup({
            align: "right center",
            padding: [14, 0],
        });
        box.boxInfoLine.add(that);

        box.boxInfoLine.label = Label({
            text: "0 - 0 / 0",
            fontSize: 16,
        })

        endGroup();

        // Center the label
        HGroup({
            align: "right center",
            width: "50%",
            padding: [40, 0],
        });
        box.boxInfoLine.add(that);

        box.lblSelectedSortKey = Label({
            text: "ALL",
            opacity: 1,
            ...box.style.lblNoDataFound,
        });
        that.elem.style.cursor = "pointer";
        that.clickable = 1;
        that.setMotion("opacity 0.2s")

        endGroup();

    };

    box.stretchLastCell = function (width) {

        if (width > 0) {
            const _itemCellIndex = box.titleCellCount - 1;

            box.itemLineList.forEach(function (itemLine, itemLineIndex) {
                itemLine["itemCell" + _itemCellIndex].width = width;
            });

            box.titleCellList[_itemCellIndex].width = width;
        }

    };

    box.calcLastCellWidth = function () {

        let totalWidth = 0;
        let newLastCellWidth = 0;

        const titleDataList = box.titleDataList;
        const originalWidth = box.width;

        titleDataList.forEach(function (titleData, titleDataIndex) {
            totalWidth += num(titleData.width);
        });

        if (originalWidth > totalWidth) {
            newLastCellWidth = originalWidth - totalWidth + num(titleDataList[titleDataList.length - 1].width);
        }

        return newLastCellWidth;

    };

    box.setItemHeight = function (itemHeight) {

        box.itemHeight = itemHeight;

        box.itemLineList.forEach(function (itemLine, itemLineIndex) {
            itemLine.height = box.itemHeight;
            itemLine.visible = 1; // WHY: Yükseklik hesaplandıktan sonra göster.
        });

    };

    box.setHeight = function (height) {

        // Yükseklik otomatik değil ise, ItemCell yüksekliğini otomatik hesapla.
        if (height != "auto") {
            box.recalcItemHeight = 1;
        } else {
            box.recalcItemHeight = 0;
        }

        // Item yüksekliği otomatik hesaplanacak.
        if (box.recalcItemHeight) {
            //box.itemHeight = (box.height - box.titleHeight - box.infoHeight) / box.itemLineCount;
        }

        box.height = height;

    };

    box.setWidth = function (width) {

        // Eğer genişlik tam olacak ise, scroll için boş alan ekle.
        if (width == "100%") {
            box.width = "calc(100% - " + (box.verticalScrollWidth + box.verticalScrollMargin) + "px)";
        } else {
            box.width = width;
        }

    };

    box.getTotalWidth = function () {
        return box.width + box.verticalScrollWidth + box.verticalScrollMargin;
    }

    box.getVerticalScrollWidth = function () {
        return box.verticalScrollWidth + box.verticalScrollMargin;
    };

    box.createLoading = function () {

        box.boxLoading = VGroup({
            color: Black(0.3),
            clickable: 1,
            round: box.style.round,
        });
        box.add(box.boxLoading);

        Icon({
            width: 32,
            height: 32,
        });
        that.load("../comp-m3/smart-table/clock.png");

        endGroup();

    };

    box.showLoading = function (show) {
        if (show) {
            box.boxLoading.visible = 1;
            box.setVerticalScrollEnabled(false);

        } else {
            box.boxLoading.visible = 0;
            box.setVerticalScrollEnabled(true);
        }
    };

    box.createResizeEvent = function () {

        const _resizeUI = function () {

            // Item yüksekliği otomatik hesaplanacak.
            if (box.recalcItemHeight) {

                const itemHeight = (box.height - box.titleHeight - box.infoHeight) / box.itemLineCount;

                if (box.itemHeight != itemHeight) {
                    box.setItemHeight(itemHeight);
                }

            }

            box.stretchLastCell(box.calcLastCellWidth());
            box.initScrollMetrics();
            box.syncScrollPosition();
            box.scrollBar.refreshScroll(); // Ekranı daraltırken, scroll gereksiz görünmesin diye.

            box.refreshData();

        };

        box.onResize(function (self) {

            // Item yüksekliği otomatik hesaplanacak.
            box.resizeTimer = waitAndRun(box.resizeTimer, _resizeUI, 3);

        });

    };

    // *** OBJECT VIEW:
    box.init = function () {

        //box.elem.style.cursor = "pointer";
        box.clickable = 1;
        // Show outside of the box. box.lblBadget will be shown at out of container.
        box.clipContent = 0;
        //box.scrollY = 1;
        box.color = "white";
        box.round = box.style.round;
        //box.elem.style.marginRight = "22px";

        if (box.invertColor == 1) box.elem.style.filter = "invert(100%)";
        box.setWidth(box.style.width);
        box.setHeight(box.style.height);

        // create the structure

        // Tıtle and Item Lıne Group Container
        box.boxHorizontalScrollableGroup = VGroup({
            align: "top left",
            width: "auto",
            height: "auto",
            padding: [0, 0],
            gap: 0,
            position: "relative",
            clipContent: 0,
            scrollX: 1,
        });
        that.elem.style.borderTopLeftRadius = box.style.round + "px";     // Üst Sol Köşe
        that.elem.style.borderTopRightRadius = box.style.round + "px";    // Üst Sağ Köşe
        that.elem.style.borderBottomRightRadius = "0px"; // Alt Sağ Köşe
        that.elem.style.borderBottomLeftRadius = "0px";   // Alt Sol Köşe
        that.elem.style.marginBottom = "50px";

        // Title Line
        box.boxTitleLine = HGroup({
            height: "auto",
            width: "auto",
            align: "top left",
            padding: [0, 0],
            gap: 0,
            color: "#65A293",
            // NOTE: this width, height: "100%" as default.
        });

        // Title Line
        // box.createTitleLine();

        endGroup();

        // Item Lıne Group
        box.boxItemLineGroup = VGroup({
            align: "top left",
            width: "auto",
            height: "auto",
            padding: [0, 0],
            gap: 0,
        });

        // Item Lines 
        //box.createItemLines();

        endGroup();

        endGroup(); // Tıtle and Item Lıne Group Container

        box.boxInfoLine = HGroup({
            bottom: 0,
            left: 0,
            height: box.infoHeight,
            width: "100%",
            align: "top left",
            padding: [0, 0],
            gap: 0,
            ...box.style.boxInfoLine,
        }); endGroup();
        that.elem.style.borderTopLeftRadius = "0px";     // Üst Sol Köşe
        that.elem.style.borderTopRightRadius = "0px";    // Üst Sağ Köşe
        that.elem.style.borderBottomRightRadius = box.style.round + "px"; // Alt Sağ Köşe
        that.elem.style.borderBottomLeftRadius = box.style.round + "px";   // Alt Sol Köşe
        that.clickable = 0;

        box.createToolbar();

        // Center the label
        HGroup();

        box.lblNoDataFound = Label({
            text: box.noDataFoundAlert,
            opacity: 0,
            ...box.style.lblNoDataFound,
        });
        that.setMotion("opacity 0.2s")

        endGroup();

        // boxBorder
        box.boxBorder = Box(0, 0, "100%", "100%", box.style.boxBorder);
        that.round = box.style.round;

        box.createVerticalScroll();

        // SCROLL BAR: Horizontal Scroll
        box.scrollBar = ScrollBar({
            scrollableBox: box.boxHorizontalScrollableGroup,
            ...box.scrollbarParams,
        });

        box.createResizeEvent();

        box.createLoading();

    };

    // *** OBJECT INIT CODE:
    box.init(); // Create UI
    box.createTitleLine();
    box.createItemLines();
    if (box.fillTestData) box.generateTestData(); // Add test data
    box.createScrollEvents();
    box.stretchLastCell(box.calcLastCellWidth());
    box.filterAndSortData();
    //box.refreshData();

    return endObject(box);

};