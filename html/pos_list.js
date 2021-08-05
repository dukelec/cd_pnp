/*
 * Software License Agreement (MIT License)
 *
 * Author: Duke Fong <d@d-l.io>
 */

import { csv_parser } from './utils/helper.js';


function search_comp_parents(comp, set_color=false, color='')
{
    let parents = [null, null];
    let pos_list = document.getElementById('pos_list');
    let comp_elm = null;
    
    let comp_list = pos_list.getElementsByClassName('list_comp');
    for (let elm of comp_list) {
        let sub0 = elm.querySelector('td');
        if (sub0.innerText == comp) {
            comp_elm = elm;
            if (set_color)
                elm.style.backgroundColor = color;
            break;
        }
    }
    
    let footprint_list = pos_list.getElementsByClassName('list_footprint');
    for (let elm of footprint_list) {
        if (elm.contains(comp_elm)) {
            let subs = elm.querySelectorAll('td');
            parents[0] = subs[0].innerText;
            if (set_color) {
                subs[0].style.backgroundColor = color;
                subs[1].style.backgroundColor = color;
            }
            break;
        }
    }
    
    let value_list = pos_list.getElementsByClassName('list_value');
    for (let elm of value_list) {
        if (elm.contains(comp_elm)) {
            let sub0 = elm.querySelector('td');
            parents[1] = sub0.innerText;
            if (set_color)
                sub0.style.backgroundColor = color;
            break;
        }
    }
    
    return parents;
}

function search_next_comp(comp)
{
    let pos_list = document.getElementById('pos_list');
    let comp_elm = null;
    let comp_next = null;
    
    let comp_list = pos_list.getElementsByClassName('list_comp');
    for (let elm of comp_list) {
        let sub0 = elm.querySelector('td');
        if (comp_elm != null) {
            comp_next = elm.innerText;
            break;
        }
        if (sub0.innerText == comp)
            comp_elm = elm;
    }
    
    return comp_next;
}

function search_current_comp()
{
    let pos_list = document.getElementById('pos_list');    
    let comp_list = pos_list.getElementsByClassName('list_comp');
    for (let elm of comp_list) {
        if (elm.style.backgroundColor) {
            let sub0 = elm.querySelector('td');
            return sub0.innerText;
        }
    }
    return null;
}


function select_comp(comp) {
    let current = search_current_comp();
    if (current)
        search_comp_parents(current, true, "");
    if (comp) {
        let parents = search_comp_parents(comp, true, "#D5F5E3");
        document.getElementById('cur_footprint').innerText = parents[0];
        document.getElementById('cur_value').innerText = parents[1];
        document.getElementById('cur_comp').innerText = comp;
    } else {
        document.getElementById('cur_footprint').innerText = "--";
        document.getElementById('cur_value').innerText = "--";
        document.getElementById('cur_comp').innerText = "--";
    }
    
    //console.log(`${comp} parents:`, parents);
    //console.log(`${comp} next:`, search_next_comp(comp));
    //console.log(`current:`, search_current_comp());
}
window.select_comp = select_comp;


function pos_to_page(pos) {
    let pos_list = document.getElementById('pos_list');
    pos_list.innerHTML = '';
    
    for (let footprint in pos) {
        let html_value = '';
        for (let value in pos[footprint]) {
            let html_comp = '';
            for (let comp of pos[footprint][value]) {
                html_comp += `
                    <tr class='list_comp' onclick=select_comp('${comp[0]}');>
                        <td>${comp[0]}</td>
                        <td>${comp[1]}</td>
                        <td>${comp[2]}</td>
                        <td>${comp[3]}</td>
                    </tr>`;
            }
            html_value += `
                <tr class='list_value'>
                    <td>${value}</td>
                    <td>
                        <table>
                            <tbody class="js-sortable-table">
                                ${html_comp}
                            </tbody>
                        </table>
                    </td>
                </tr>`;
        }
        let html = `
            <tr class='list_footprint'>
                <td>${footprint}</td>
                <td>--</td>
                <td colspan="5">
                    <table>
                        <tbody class="js-sortable-table">
                            ${html_value}
                        </tbody>
                    </table>
                </td>
            </tr>`;
        pos_list.insertAdjacentHTML('beforeend', html);
    }
}

function pos_from_page() {
    let pos = {};
    let pos_list = document.getElementById('pos_list');
    let footprint_list = pos_list.getElementsByClassName('list_footprint');
    for (let footprint_elm of footprint_list) {
        let footprint = footprint_elm.querySelector('td').innerText;
        pos[footprint] = {};
        let value_list = footprint_elm.getElementsByClassName('list_value');
        for (let value_elm of value_list) {
            let value = value_elm.querySelector('td').innerText;
            pos[footprint][value] = [];
            let comp_list = value_elm.getElementsByClassName('list_comp');
            for (let comp_elm of comp_list) {
                let comp_tds = comp_elm.querySelectorAll('td');
                pos[footprint][value].push([comp_tds[0].innerText, comp_tds[1].innerText, comp_tds[2].innerText, comp_tds[3].innerText]);
            }
        }
    }
    return pos;
}

function csv_to_pos(csv)
{
    let csv_list = csv_parser(csv);
    let pos = {};
    for (let row of csv_list) {
        if (row[0] == 'Ref' || !row[0].length)
            continue;
        let row_ = [row[0], row[3].slice(0, -3), row[4].slice(0, -3), row[5].slice(0, -5)];
        if (row[2] in pos) {
            if (row[1] in pos[row[2]])
                pos[row[2]][row[1]].push(row_);
            else
                pos[row[2]][row[1]] = [row_];
        } else {
            pos[row[2]] = {};
            pos[row[2]][row[1]] = [row_];
        }
    }
    return pos;
}

export {
    search_comp_parents, search_next_comp, search_current_comp, select_comp,
    pos_to_page, pos_from_page, csv_to_pos
};