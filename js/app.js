// Small acrostic/crossword-like game for projector use.
// This script supports loading a puzzle from a JSON file placed at `puzzles/puzzle1.json`.

// Defaults (will be overwritten by loaded JSON if available)
let GRID_ROWS = 7;
let GRID_COLS = 12;
let ENTRIES = [
	{n:1, row:0, col:3, len:6, clue: 'Đại hội nào tổng kết 45 năm lãnh đạo cách mạng và đề ra đường lối cách mạng XHCN trong giai đoạn mới (tháng 12/1976)?'},
	{n:2, row:1, col:2, len:7, clue: 'Đại hội V (1982) xác định lĩnh vực nào là “mặt trận hàng đầu”? '},
	{n:3, row:2, col:1, len:5, clue: 'Cuộc chiến đấu bảo vệ Tổ quốc năm 1979 diễn ra chủ yếu ở khu vực biên giới ...'},
	{n:4, row:3, col:0, len:11, clue: 'Nghị quyết 25/CP (01/1981) áp dụng cơ chế gì trong nông nghiệp?'},
	{n:5, row:4, col:1, len:9, clue: 'Ai được bầu làm Tổng Bí thư sau khi đồng chí Lê Duẩn qua đời (7/1986)?'},
	{n:6, row:5, col:1, len:6, clue: 'Khủng hoảng 1985–1986 thể hiện rõ nhất ở lĩnh vực nào?'}
];
let ACRO_COL = 3;
let BLOCKS = [[0,0],[0,1],[0,2],[1,0],[1,1],[2,0],[4,0],[5,0],[6,0]];

const gridEl = document.getElementById('grid');
const rowNumsEl = document.getElementById('rowNumbers');
const selectedClueEl = document.getElementById('selectedClue');
const clueListEl = document.getElementById('clueList');
const solutionBoxes = document.getElementById('solutionBoxes');
const resetBtn = document.getElementById('resetBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const showAcrosticBtn = document.getElementById('showAcrosticBtn');

const popupEl = document.getElementById('answerPopup');
const popupTitleEl = document.getElementById('answerPopupTitle');
const popupMainEl = document.getElementById('answerPopupMain');
const popupSubEl = document.getElementById('answerPopupSub');
const popupCloseBtn = document.getElementById('answerPopupClose');

let PUZZLE_ANSWER_LABEL = '';

let currentEntryN = null;

// Build an internal 2D array representing cells. null = empty letter cell, '#' = black
let cells = [];
function initCells(){
	cells = Array.from({length:GRID_ROWS},()=>Array.from({length:GRID_COLS},()=>({block:false, letter:'', invisible:false})));
	// place blocks from BLOCKS variable
	for(const [r,c] of BLOCKS) if(r>=0 && r<GRID_ROWS && c>=0 && c<GRID_COLS) cells[r][c].block = true;
	// mark cells that are not part of any entry as invisible (not used for input)
	const used = new Set();
	for(const e of ENTRIES){
		for(let i=0;i<e.len;i++) used.add(`${e.row}:${e.col+i}`);
	}
	for(let r=0;r<GRID_ROWS;r++){
		for(let c=0;c<GRID_COLS;c++){
			// hide non-used cells
			if(!cells[r][c].block && !used.has(`${r}:${c}`)){
				cells[r][c].invisible = true;
			}
			// hide some front/leading blocks (columns near left) to match projector layout
			// rule: if a block is in column < 3, make it invisible (keeps spacing but not shown)
			if(cells[r][c].block && c < 3) cells[r][c].invisible = true;
		}
	}
}

function createGrid(){
	gridEl.innerHTML='';
	gridEl.style.gridTemplateColumns = `repeat(${GRID_COLS},48px)`;
	for(let r=0;r<GRID_ROWS;r++){
		for(let c=0;c<GRID_COLS;c++){
			const cell = document.createElement('div');
			cell.className = 'cell';
			cell.dataset.r = r; cell.dataset.c = c;
			if(c === ACRO_COL) cell.classList.add('pink');
			if(cells[r][c].invisible){
				cell.classList.add('invisible');
			} else if(cells[r][c].block){
				cell.classList.add('block');
			} else {
				cell.classList.add('input');
				cell.tabIndex = 0;
				cell.addEventListener('keydown', onCellKeyDown);
				cell.addEventListener('click', ()=>selectCell(r,c));
				// double-click to clear cell quickly
				cell.addEventListener('dblclick', ()=>{ setCellLetter(r,c,''); });
			}
			gridEl.appendChild(cell);
		}
	}
	// place numbering for entry starts
	for(const e of ENTRIES){
		const numCell = gridEl.querySelector(`.cell[data-r='${e.row}'][data-c='${e.col}']`);
		if(numCell && !numCell.classList.contains('block')){
			const span = document.createElement('div'); span.className='number'; span.textContent = e.n;
			numCell.appendChild(span);
		}
	}
	renderRowNumbers();
}

// Document-level key handling so Backspace/Delete works even if focus handling changes
document.addEventListener('keydown', (ev)=>{
	const active = document.activeElement;
	if(active && active.classList && active.classList.contains('cell')){
		if(ev.key === 'Backspace' || ev.key === 'Delete'){
			const r = +active.dataset.r, c = +active.dataset.c;
			setCellLetter(r,c,'');
			ev.preventDefault();
		}
	}
});

function onCellKeyDown(ev){
	const el = ev.currentTarget;
	if(ev.key.length === 1 && /[a-zA-Z\\u0000-\\u007F]/.test(ev.key)){
		const ch = ev.key.toUpperCase();
		setCellLetter(+el.dataset.r, +el.dataset.c, ch);
		// move right if possible
		const next = findNextCell(+el.dataset.r, +el.dataset.c);
		if(next){
			focusCell(next.r,next.c);
		}
		ev.preventDefault();
	} else if(ev.key === 'Backspace'){
		setCellLetter(+el.dataset.r, +el.dataset.c, '');
		ev.preventDefault();
	} else if(ev.key === 'ArrowRight'){
		const next = findNextCell(+el.dataset.r, +el.dataset.c);
		if(next) focusCell(next.r,next.c);
		ev.preventDefault();
	} else if(ev.key === 'ArrowLeft'){
		const prev = findPrevCell(+el.dataset.r, +el.dataset.c);
		if(prev) focusCell(prev.r,prev.c);
		ev.preventDefault();
	} else if(ev.key === 'Delete'){
		setCellLetter(+el.dataset.r, +el.dataset.c, '');
		ev.preventDefault();
	}
}

function setCellLetter(r,c,ch){
	cells[r][c].letter = ch;
	const el = gridEl.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
	if(el) el.textContent = ch;
	updateSolution();
}

function findNextCell(r,c){
	// move right until non-block and non-invisible
	for(let cc=c+1;cc<GRID_COLS;cc++) if(!cells[r][cc].block && !cells[r][cc].invisible) return {r, c:cc};
	return null;
}
function findPrevCell(r,c){
	for(let cc=c-1;cc>=0;cc--) if(!cells[r][cc].block && !cells[r][cc].invisible) return {r, c:cc};
	return null;
}

function focusCell(r,c){
	const el = gridEl.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
	if(el) el.focus();
}

function selectCell(r,c){
	// if cell belongs to an entry, reveal that entry's clue and highlight its cells
	const matches = ENTRIES.filter(e=>{
		if(e.row === r && c>=e.col && c<e.col+e.len) return true;
		if(e.row === r && e.col === c) return true;
		return false;
	});
	if(matches.length) revealEntry(matches[0].n);
}

function renderRowNumbers(){
	rowNumsEl.innerHTML = '';
	for(let r=0;r<GRID_ROWS;r++){
		const dn = document.createElement('div'); dn.className='row-number';
		const ent = ENTRIES.find(e=>e.row===r);
		if(ent) { dn.textContent = ent.n; dn.classList.add('btn'); dn.addEventListener('click', ()=>revealEntry(ent.n)); }
		rowNumsEl.appendChild(dn);
	}
}

function renderClues(){
	clueListEl.innerHTML='';
	for(const e of ENTRIES){
		const li = document.createElement('li');
		const btn = document.createElement('button'); btn.className='clueBtn'; btn.textContent = e.n; btn.dataset.n = e.n;
		btn.addEventListener('click', ()=>revealEntry(e.n));
		const txt = document.createElement('div'); txt.className='clueText'; txt.id = `clue-${e.n}`; txt.textContent = '(ẩn)';
		li.appendChild(btn); li.appendChild(txt);
		clueListEl.appendChild(li);
	}
}

function revealEntry(n){
	// show clue text, highlight cells
	renderClues();
	const ent = ENTRIES.find(x=>x.n===n);
	if(!ent) return;
	const txt = document.getElementById(`clue-${n}`);
	txt.textContent = ent.clue;
	txt.classList.add('visible');
	// clear previous highlights
	document.querySelectorAll('.cell').forEach(x=>x.classList.remove('highlight'));
	for(let i=0;i<ent.len;i++){
		const r = ent.row, c = ent.col + i;
		const cellEl = gridEl.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
		if(cellEl) cellEl.classList.add('highlight');
	}
	// show in the large banner at top for projector readability
	selectedClueEl.textContent = `Câu ${ent.n}: ${ent.clue}`;
	// highlight corresponding row number
	document.querySelectorAll('.row-number').forEach((el,idx)=> el.classList.toggle('active', ENTRIES.find(e=>e.row===idx && e.n===n)));
	// focus first cell of entry
	focusCell(ent.row, ent.col);

	// set current entry and show the show-answer button
	currentEntryN = n;
	if(showAnswerBtn) showAnswerBtn.style.display = '';
}

function revealAllClues(){
	for(const e of ENTRIES){
		const txt = document.getElementById(`clue-${e.n}`);
		if(txt){ txt.textContent = e.clue; txt.classList.add('visible'); }
	}
	selectedClueEl.textContent = '(Tất cả câu hỏi đã hiển thị)';
	// when all clues shown, hide the per-entry show answer button
	currentEntryN = null;
	if(showAnswerBtn) showAnswerBtn.style.display = 'none';
}

function updateSolution(){
	solutionBoxes.innerHTML='';
	// compute acrostic letter from each entry's answer (expected) and compare with current grid
	for(const e of ENTRIES){
		const idx = ACRO_COL - e.col; // index inside the entry that intersects the acro column
		const expected = (e.answer && typeof e.answer === 'string' && idx>=0 && idx < e.answer.length) ? e.answer[idx].toUpperCase() : '';
		const actual = (idx>=0 && idx<e.len) ? (cells[e.row][ACRO_COL].letter || '') : '';
		const box = document.createElement('div'); box.className='box';
		box.textContent = expected || '';
		if(actual){
			if(expected && actual.toUpperCase() === expected) box.classList.add('matched');
			else box.classList.add('mismatch');
		}
		solutionBoxes.appendChild(box);
	}
}

function resetAll(){
	for(let r=0;r<GRID_ROWS;r++){
		for(let c=0;c<GRID_COLS;c++){
			if(!cells[r][c].block) cells[r][c].letter='';
		}
	}
	// redraw cell contents and styles
	document.querySelectorAll('.cell').forEach(el=>{
		if(!el.classList.contains('block')) el.textContent='';
		el.classList.remove('highlight');
	});
	// hide clues
	selectedClueEl.textContent = '(Chọn câu để hiển thị câu hỏi lớn tại đây)';
	renderClues();
	updateSolution();
	currentEntryN = null;
	if(showAnswerBtn) showAnswerBtn.style.display = 'none';
}

function clearCurrentEntry(){
	// find currently highlighted entry by looking for highlighted cells
	const any = document.querySelector('.cell.highlight');
	if(!any) return;
	const r = +any.dataset.r;
	// find entry which is both on this row and has highlighted first cell
	const ent = ENTRIES.find(e=> e.row===r && document.querySelector(`.cell[data-r='${e.row}'][data-c='${e.col}']`)?.classList.contains('highlight'));
	if(!ent) return;
	for(let i=0;i<ent.len;i++) setCellLetter(ent.row, ent.col+i, '');
}

resetBtn.addEventListener('click', resetAll);
if(showAnswerBtn) showAnswerBtn.addEventListener('click', ()=>{ showAnswerForCurrent(); });
if(showAcrosticBtn) showAcrosticBtn.addEventListener('click', ()=>{ revealAcrosticColumn(); });

// Load puzzle JSON (if available) then initialize UI
async function loadPuzzle(path){
	try{
		const resp = await fetch(path);
		if(!resp.ok) throw new Error('No puzzle file');
		const data = await resp.json();
		GRID_ROWS = data.gridRows || GRID_ROWS;
		GRID_COLS = data.gridCols || GRID_COLS;
		ACRO_COL = (typeof data.acroCol === 'number') ? data.acroCol : ACRO_COL;
		BLOCKS = Array.isArray(data.blocks) ? data.blocks : BLOCKS;
	ENTRIES = Array.isArray(data.entries) ? data.entries.map(e=>({n:e.n,row:e.row,col:e.col,len:e.len||e.answer?.length||0,clue:e.clue||'',answer:e.answer||'', label: e.label||''})) : ENTRIES;
	PUZZLE_ANSWER_LABEL = data['answer-label'] || data['answer_label'] || '';
	}catch(err){
		// fallback to defaults already set
		console.warn('Could not load puzzle JSON, using defaults.', err);
	}
	initCells(); createGrid(); renderClues(); updateSolution();
}

// try load puzzle at relative path; if running via file:// this may fail, so defaults will be used
loadPuzzle('puzzles/puzzle1.json');

// show answer: reveal letters for the current highlighted entry with animation
function showAnswerForCurrent(){
	if(!currentEntryN) return;
	const ent = ENTRIES.find(e=>e.n===currentEntryN);
	if(!ent) return;
	const answer = (ent.answer||'').toString().toUpperCase();
	// if no answer provided, do nothing
	if(!answer || answer.length === 0) return;
	for(let i=0;i<ent.len;i++){
		const r = ent.row, c = ent.col + i;
		const cellEl = gridEl.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
		const ch = answer[i] || '';
		// staggered animation
		(function(cell, rr, cc, letter, idx){
			setTimeout(()=>{
				// set model
				cells[rr][cc].letter = letter;
				if(cell){
					cell.textContent = letter;
					cell.classList.add('reveal-anim');
					// remove input ability
					cell.dataset.locked = '1';
					cell.tabIndex = -1;
					cell.classList.remove('input');
					setTimeout(()=>{
						cell.classList.remove('reveal-anim');
						cell.classList.add('revealed');
					}, 220);
				}
				updateSolution();
			}, idx * 90);
		})(cellEl, r, c, ch, i);
	}
	// once revealed, hide the show button
	if(showAnswerBtn) showAnswerBtn.style.display = 'none';

	// after animation completes, show popup with label (if provided)
	const totalDelay = (ent.len * 90) + 320;
	setTimeout(()=>{
		const label = ent.label || ent.answer || 'Đáp án đúng';
		showPopup({title:`Câu trả lời là:`, sub: ent.label || ''});
	}, totalDelay);
}

// reveal the vertical acrostic column immediately (uses entry.answer per-row)
function revealAcrosticColumn(){
	// iterate entries and reveal the expected letter at ACRO_COL for each entry row
	for(let i=0;i<ENTRIES.length;i++){
		const e = ENTRIES[i];
		const idx = ACRO_COL - e.col;
		const expected = (e.answer && typeof e.answer === 'string' && idx>=0 && idx < e.answer.length) ? e.answer[idx].toUpperCase() : '';
		if(!expected) continue;
		const r = e.row, c = ACRO_COL;
		const cellEl = gridEl.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
		(function(cell, rr, cc, letter, delay){
			setTimeout(()=>{
				cells[rr][cc].letter = letter;
				if(cell){
					// ensure pink class remains
					cell.classList.add('pink');
					cell.textContent = letter;
					cell.classList.add('reveal-anim');
					cell.dataset.locked = '1';
					cell.tabIndex = -1;
					cell.classList.remove('input');
					setTimeout(()=>{
						cell.classList.remove('reveal-anim');
						cell.classList.add('revealed');
						// reinforce pink styling when revealed
						cell.classList.add('pink');
					}, 220);
				}
				updateSolution();
			}, delay);
		})(cellEl, r, c, expected, i * 120);
	}
	// hide the acrostic button after revealing
	if(showAcrosticBtn) showAcrosticBtn.style.display = 'none';

	// after all rows animated, show puzzle-level label if available
	const validCount = ENTRIES.reduce((acc,e)=>{
		const idx = ACRO_COL - e.col; return acc + ((e.answer && typeof e.answer === 'string' && idx>=0 && idx<e.answer.length)?1:0);
	},0);
	const totalDelay = (validCount * 120) + 320;
	setTimeout(()=>{
		// build acrostic string
		const acro = ENTRIES.map(e=>{
			const idx = ACRO_COL - e.col; return (e.answer && idx>=0 && idx < e.answer.length) ? e.answer[idx].toUpperCase() : '';
		}).join('');
		const label = PUZZLE_ANSWER_LABEL || 'Đáp án dọc';
		showPopup({title: 'Ô chữ bí ẩn: ', sub: label});
	}, totalDelay);
}

function showPopup({title='', main='', sub=''}, duration=3800){
	if(!popupEl || !popupMainEl || !popupTitleEl) return;
	popupTitleEl.textContent = title || '';
	popupMainEl.textContent = main || '';
	popupSubEl.textContent = sub || '';
	popupEl.classList.add('show');
	popupEl.setAttribute('aria-hidden','false');
	// auto hide after duration
	const t = setTimeout(()=>{ hidePopup(); }, duration);
	// allow manual close
	popupCloseBtn.onclick = ()=>{ clearTimeout(t); hidePopup(); };
}

function hidePopup(){
	if(!popupEl) return;
	popupEl.classList.remove('show');
	popupEl.setAttribute('aria-hidden','true');
}

if(popupCloseBtn) popupCloseBtn.addEventListener('click', hidePopup);
