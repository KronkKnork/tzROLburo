window.onload = function() {
    
    //load JSON
    var file = "json/jk-obj.json";
    var arrApartment;
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            arrApartment = JSON.parse(this.responseText);
        }
        if (arrApartment !== undefined) {
            //стрелка
            let paginationArrow = document.getElementsByClassName('paginationArrow')[0];
            paginationArrow.addEventListener('click', clickArrowNext);
            document.querySelector('.filter-button-reset').classList.add('disabled');
            //переменные для ползунков и квартир
            let notesOnPage = 10,
                sliderPrice = document.getElementById('filter-price'),
                sliderArea = document.getElementById('filter-area'),
                price = getPrice(arrApartment);
            //создание ползунков
            range(sliderPrice, sliderArea, price);
            //загрузка квартир
            loadApprtment(arrApartment, notesOnPage);

            //__________filtr___________//
            let fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax, filtrArrApartment;
            //получение квартир при движении мышки по фильтру
            document.querySelector('.card-filter').addEventListener('mousemove', function() {
                filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
                getPrice(filtrArrApartment);
            });
            //клик по кол-ву комнат
            let numRooms = document.querySelectorAll('.count-rooms__btn');
            for (let numRoom of numRooms) {
                numRoom.addEventListener('click', function() {
                    if (this.classList.contains('selected-room')) {
                        this.classList.toggle('selected-room');
                    } else {
                        for (const numRoom of numRooms) {
                            numRoom.classList.remove('selected-room');
                        }
                        this.classList.toggle('selected-room');
                    }
                    filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
                    getPrice(filtrArrApartment);
                });
            }
            //show open-card apartment
            document.querySelector('.filter-button-show').addEventListener('click', function() {
                filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
                if (filtrArrApartment == '') {
                    document.querySelector('.card-not-found').style.display = 'block';
                    document.getElementById('pagination').style.display = 'none';
                    document.querySelector('.card-apartment').style.display = 'none';
                } else {
                    document.querySelector('.card-not-found').style.display = 'none';
                    document.getElementById('pagination').style.display = 'block';
                    document.querySelector('.card-apartment').style.display = 'block';
                }
                loadApprtment(filtrArrApartment, notesOnPage);
                document.querySelector('.filter-button-reset').classList.remove('disabled');
            })
            //reset
            let btnResets = document.querySelectorAll('.filter-button-reset, .card-not-found-svg__button');
            for (const btnReset of btnResets) {
                btnReset.addEventListener('click',function(){
                    let sliderPrice = document.getElementById('filter-price'),
                        sliderArea = document.getElementById('filter-area'),
                        price = getPrice(arrApartment);
                    sliderPrice.noUiSlider.destroy();
                    sliderArea.noUiSlider.destroy();
                    range(sliderPrice, sliderArea, price);
                    document.querySelector('.selected-room') && document.querySelector('.selected-room').click();
                    filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
                    document.querySelector('.filter-button-show').click();
                    document.querySelector('.filter-button-reset').classList.add('disabled');
                });
            }
            
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    
    //загрузка квартир с обновлением страницы
    function loadApprtment(arrApartment, notesOnPage) {
        document.getElementById('wrapper-all-apartment').innerHTML = "";
        let noteOnePage = arrApartment.slice(0, notesOnPage);
        for (let noteOne of noteOnePage) {
            let wrapperApartment = document.getElementById('wrapper-all-apartment');
            let source = document.getElementById("template-apartment").innerHTML,
                template = Handlebars.compile(source),
                html = template(noteOne);
            wrapperApartment.insertAdjacentHTML('beforeend' ,html);
            //деление цен на разряды
            let arrPrice = document.querySelectorAll('.column-price, .info-apartment__price-size .price, .additional-info-body .price');
            arrPrice.forEach(function(el, i, arr) {
                let price = el.textContent;
                price = price.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
                el.innerHTML = price;
            });
        }
        let paginationArrow = document.querySelectorAll('.paginationArrow')[0],
            countNumPag = Math.ceil(arrApartment.length / notesOnPage);
        createPag(paginationArrow, countNumPag);
        let paginationLi = document.querySelectorAll('#pagination li:not(.paginationArrow)');
        pagination(arrApartment, paginationLi, notesOnPage);
        openCard();
        validation();
        document.getElementById('count-apartment').innerHTML = arrApartment.length;
        let likes = document.getElementsByClassName('like');
        for (let like of likes) {
            like.addEventListener('click', likeClick);
        }
    };
    //create pagination
    function createPag(paginationArrow, countNumPag) {
        let numLis = paginationArrow.parentNode.querySelectorAll('li:not(.paginationArrow)');
        for (let element of numLis) {
            element.remove();
        }
        countNumPag < 2 ? paginationArrow.classList.add('disabled') : paginationArrow.classList.remove('disabled');
        for (let i = 0; i < countNumPag; i++) {
            numPage = i + 1;
            numPage == 1 ? 
                paginationArrow.insertAdjacentHTML('beforebegin', '<li class="active"><span>' + numPage + '</span></li>') :
                paginationArrow.insertAdjacentHTML('beforebegin', '<li><span>' + numPage + '</span></li>')
        }
    };
    //пагинация
    function pagination(arrApartment, paginationLi, notesOnPage) {
        for (let item of paginationLi) {
            item.addEventListener('click', function(){
                let pageNum = +this.childNodes[0].innerHTML,
                    start = (pageNum - 1) * notesOnPage,
                    end = start + notesOnPage,
                    notes = arrApartment.slice(start, end); //полученая коллекция на выбраной странице
                for (let element of paginationLi) {
                    element.classList.remove('active');
                }
                this.classList.add('active');
                //disabled arrow
                if (this.nextElementSibling.classList.contains('paginationArrow')) {
                    this.nextElementSibling.classList.add('disabled');
                } else { 
                    document.querySelector('.paginationArrow').classList.remove('disabled')
                }
                //handlebars
                document.getElementById('wrapper-all-apartment').innerHTML = "";
                for (let note of notes) {
                    let wrapperApartment = document.getElementById('wrapper-all-apartment'),
                        source = document.getElementById("template-apartment").innerHTML,
                        template = Handlebars.compile(source),
                        html = template(note);
                    wrapperApartment.insertAdjacentHTML('beforeend' ,html);
                    //деление цен на разряды
                    let arrPrice = document.querySelectorAll('.column-price, .info-apartment__price-size .price, .additional-info-body .price');
                    arrPrice.forEach(function(el, i, arr) {
                        let price = el.textContent;
                        price = price.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
                        el.innerHTML = price;
                    });
                }
                openCard();
                validation();
                let likes = document.getElementsByClassName('like');
                for (let like of likes) {
                    like.addEventListener('click', likeClick);
                }
            })
        }
    };
    //раскрытие карточки квартиры с обновлением страницы
    function openCard() {
        let miniApartments = document.getElementsByClassName('mini-apartment');
        for (let miniApartment of miniApartments) {
            miniApartment.addEventListener('click', function() {
                let miniCard = this,       
                    idCard = this.getAttribute('data-mini-card-id'),
                    openCard = this.nextElementSibling;
                //закрытие других
                let closeOpenCards = document.querySelectorAll(`.open-apartment:not([data-open-card-id="${idCard}"])`),
                    closeHrArrows = document.querySelectorAll(`.mini-apartment:not([data-mini-card-id="${idCard}"])`),
                    closeShadows = getSiblings(this.parentNode);
                for (let openCard of closeOpenCards) {
                    openCard.classList.remove('ds');
                }
                for (let closeHrArrow of closeHrArrows) {
                    closeHrArrow.classList.remove('dh-before');
                    closeHrArrow.classList.remove('open-card');
                    closeHrArrow.querySelector('.open-card-icon').style.transform = 'rotate(0deg)';
                    //closeHrArrow.querySelector('.open-card-icon').style.transition = '.6s transform';
                    closeHrArrow.querySelector('.open-card-icon path').style.fill = '#79818c';
                }
                for (let closeShadow of closeShadows) {
                    closeShadow.classList.remove('ds-box-shadow');
                }
                openCard.classList.contains('ds') ? openCard.classList.remove('ds') : openCard.classList.add('ds');
                miniCard.classList.contains('dh-before') ? miniCard.classList.remove('dh-before') : miniCard.classList.add('dh-before');
                miniCard.parentNode.classList.contains('ds-box-shadow') ? miniCard.parentNode.classList.remove('ds-box-shadow') : miniCard.parentNode.classList.add('ds-box-shadow');
                miniCard.classList.contains('open-card') ? miniCard.classList.remove('open-card') : miniCard.classList.add('open-card');

                if (miniCard.classList.contains('open-card')) {
                    miniCard.querySelector('.open-card-icon').style.transform = 'rotate(180deg)';
                    miniCard.querySelector('.open-card-icon path').style.fill = '#367ee7';
                } else {
                    miniCard.querySelector('.open-card-icon').style.transform = 'rotate(0deg)';
                    miniCard.querySelector('.open-card-icon path').style.fill = '#79818c';
                }
            })
        }
    };
    //получить соседей
    function getSiblings(elem) {
        var siblings = [];
        var sibling = elem;
        while (sibling.previousSibling) {
            sibling = sibling.previousSibling;
            sibling.nodeType == 1 && siblings.push(sibling);
        }
    
        sibling = elem;
        while (sibling.nextSibling) {
            sibling = sibling.nextSibling;
            sibling.nodeType == 1 && siblings.push(sibling);
        }
    
        return siblings;
    }
    function validation() {
        let phoneInputs = document.querySelectorAll('.application-form__phone input'),
            nameInputs = document.querySelectorAll('.application-form__name input'),
            filtrInputs = document.querySelectorAll('.application-form input');
        for (let phoneInput of phoneInputs) {
            phoneInput.addEventListener('focus', function() {
                this.value = '+ 7';
            });
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^\+\d]/g, '');
            });
        }
        for (let nameInput of nameInputs) {
            nameInput.addEventListener('input', function() {
                this.value = this.value.replace(/[0-9+ ]/g, '');
            });
        }
        for (let filtrInput of filtrInputs) {
            filtrInput.addEventListener('input', validatorViltrInput);
            filtrInput.addEventListener('click', validatorViltrInput);
            function validatorViltrInput() {
                let input1 = this,
                    input1ParentSublings = getSiblings(this.parentNode.closest('.application-form__input')),
                    input2;
                for (let input1ParentSubling of input1ParentSublings) {
                    if (input1ParentSubling.classList.contains('application-form__input')) { 
                        input2 = input1ParentSubling.querySelectorAll('input')[0]; 
                    }
                }
                if (input1.checkValidity() && input2.checkValidity() && input2.value !== '') {
                    this.closest('.application-form').querySelectorAll('.btn-yelow')[0].classList.remove('disabled');
                } else {
                    this.closest('.application-form').querySelectorAll('.btn-yelow')[0].classList.add('disabled');
                }
            }
        }
    }
    function likeClick(event) {
        event.stopPropagation();
        this.classList.toggle('like-fill');
    }
    //изменение цены в карточке справа
    function getPrice(arrApartment) {
        let price = {};
        price.priceMin = 999999999;
        price.priceMax = 0;
        price.priceM2Min = 999999999;
        price.priceM2Max = 0;
        price.areaMin = 999999999;
        price.areaMax = 0;
        for (let noteOne of arrApartment) {
            (price.priceMin >= noteOne.price) && (price.priceMin = noteOne.price);
            (price.priceMax <= noteOne.price) && (price.priceMax = noteOne.price);
            (price.priceM2Min >= noteOne.priceM2) && (price.priceM2Min = noteOne.priceM2);
            (price.priceM2Max <= noteOne.priceM2) && (price.priceM2Max = noteOne.priceM2);
            (price.areaMin >= noteOne.totalArea) && (price.areaMin = noteOne.totalArea);
            (price.areaMax <= noteOne.totalArea) && (price.areaMax = noteOne.totalArea);
        }
        let priceReturn = Object.assign({}, price);
        if (price.priceMax == 0) {
            document.querySelector('.card-mini-statistics__price .price-min').innerHTML = 0;
            document.querySelector('.card-mini-statistics__price .price-max').innerHTML = 0;
            document.querySelector('.card-mini-statistics__priceM2 .priceM2-min').innerHTML = 0;
            document.querySelector('.card-mini-statistics__priceM2 .priceM2-max').innerHTML = 0;
        } else {
            price.priceMin = (price.priceMin/1000000).toFixed(1);
            price.priceMax = (price.priceMax/1000000).toFixed(1);
            price.priceM2Min = String(price.priceM2Min).replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
            price.priceM2Max = String(price.priceM2Max).replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
            document.querySelector('.card-mini-statistics__price .price-min').innerHTML = price.priceMin;
            document.querySelector('.card-mini-statistics__price .price-max').innerHTML = price.priceMax;
            document.querySelector('.card-mini-statistics__priceM2 .priceM2-min').innerHTML = price.priceM2Min;
            document.querySelector('.card-mini-statistics__priceM2 .priceM2-max').innerHTML = price.priceM2Max;
        }
        return priceReturn;
    }
    //range
    function range(sliderPrice, sliderArea, price) {
        //range price
        noUiSlider.create(sliderPrice, {
            start: [price.priceMin, price.priceMax],
            connect: true,
            step: 100,
            range: {
                'min': price.priceMin,
                'max': price.priceMax
            }
        });
        let rangePrice = [
            document.getElementById('price-range-1'),
            document.getElementById('price-range-2')
        ],  
            rangePrice1 = document.getElementById('price-range-1'),
            rangePrice2 = document.getElementById('price-range-2');

        sliderPrice.noUiSlider.on('update', function (values, handle) {
            values[handle] = values[handle].substr(0, values[handle].length - 3)
            rangePrice[handle].value = values[handle].replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
        });
        rangePrice1.addEventListener('change', function () {
            sliderPrice.noUiSlider.set([this.value.replace(/(\s){1,}/g, ''), null]);
        });
        rangePrice2.addEventListener('change', function () {
            sliderPrice.noUiSlider.set([null, this.value.replace(/(\s){1,}/g, '')]);
        });
        //range area
        noUiSlider.create(sliderArea, {
            start: [price.areaMin, price.areaMax],
            connect: true,
            step: 1,
            range: {
                'min': price.areaMin,
                'max': price.areaMax
            }
        });
        let rangeAreas = [
            document.getElementById('area-range-1'),
            document.getElementById('area-range-2')
        ],  
            rangeArea1 = document.getElementById('area-range-1'),
            rangeArea2 = document.getElementById('area-range-2');

        sliderArea.noUiSlider.on('update', function (values, handle) {
            values[handle] = values[handle].substr(0, values[handle].length - 3)
            rangeAreas[handle].value = values[handle].replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
        });
        rangeArea1.addEventListener('change', function () {
            sliderArea.noUiSlider.set([this.value, null]);
        });
        rangeArea2.addEventListener('change', function () {
            sliderArea.noUiSlider.set([null, this.value]);
        });
    }
    //get params
    function getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax) {
        fRooms = document.getElementsByClassName('selected-room')[0] 
            ? document.getElementsByClassName('selected-room')[0].getAttribute('data-btn-filter')
            : undefined;
        fPriceMin = document.getElementById('price-range-1').value.replace(/(\s){1,}/g, '');
        fPriceMax = document.getElementById('price-range-2').value.replace(/(\s){1,}/g, '');
        fAreaMin = document.getElementById('area-range-1').value.replace(/(\s){1,}/g, '');
        fAreaMax = document.getElementById('area-range-2').value.replace(/(\s){1,}/g, '');
        return getArrApartment(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
    }
    //получение квартир по заданой фильтрации
    function getArrApartment(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax) {
        let arrApartmentFilter = [],
            arrIndex = 0;
        for (let noteOne of arrApartment) {
            if (fRooms == undefined) {
                if (noteOne.price >= Number(fPriceMin) && noteOne.price <= Number(fPriceMax) && noteOne.totalArea >= Number(fAreaMin) && noteOne.totalArea <= Number(fAreaMax)) {
                    arrApartmentFilter[arrIndex] =  noteOne;
                    arrIndex++;
                }
            } else {
                if (noteOne.filterRooms == fRooms && noteOne.price >= Number(fPriceMin) && noteOne.price <= Number(fPriceMax) && noteOne.totalArea >= Number(fAreaMin) && noteOne.totalArea <= Number(fAreaMax)) {
                    arrApartmentFilter[arrIndex] =  noteOne;
                    arrIndex++;
                }
            }
        } 
        document.querySelector('.filter-button-show span').innerHTML = arrApartmentFilter.length;
        return arrApartmentFilter;
    };
    function clickArrowNext() {
        let activePags = document.querySelectorAll('#pagination .active');
        for (const activePag of activePags) {
            if (!activePag.nextElementSibling.classList.contains('paginationArrow')) {
                this.classList.remove('disabled');
                let nextAcnivePags = activePag.nextElementSibling.getElementsByTagName('span');
                for (const nextAcnivePag of nextAcnivePags) {
                    nextAcnivePag.click()
                }
            }
        }
    }
};