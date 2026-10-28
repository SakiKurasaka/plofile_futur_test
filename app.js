function updateScale() {
  document.documentElement.style.setProperty('--s', String(Math.min(window.innerWidth / 1920, 1)));
}
window.addEventListener('resize', updateScale);
const toggle = document.querySelector('#menu-toggle');
const menu = document.querySelector('#site-menu');
function closeMenu() {
  menu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'メニューを開く');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.menu')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
function openDialog(dialog) {
  closeMenu();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
});
const artworks = [...document.querySelectorAll('.artwork')];
let activeArtwork = 0;
function displayArtwork(index) {
  activeArtwork = (index + artworks.length) % artworks.length;
  const button = artworks[activeArtwork];
  const originalImage = button.querySelector('img');
  const image = document.querySelector('#artwork-image');
  image.src = originalImage.getAttribute('src');
  image.alt = originalImage.alt;
  image.width = Number(originalImage.getAttribute('width'));
  image.height = Number(originalImage.getAttribute('height'));
  document.querySelector('#artwork-title').textContent = button.closest('.gallery').dataset.category;
  document.querySelector('#artwork-counter').textContent = `WORK ${String(button.dataset.position).padStart(2, '0')} / 06`;
}
artworks.forEach((button, index) => button.addEventListener('click', () => {
  displayArtwork(index);
  openDialog(document.querySelector('#artwork-dialog'));
}));
document.querySelector('#previous-artwork').addEventListener('click', () => displayArtwork(activeArtwork - 1));
document.querySelector('#next-artwork').addEventListener('click', () => displayArtwork(activeArtwork + 1));
document.querySelector('#artwork-dialog').addEventListener('keydown', event => {
  if (event.target.tagName === 'BUTTON' && event.target.classList.contains('close-dialog')) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); displayArtwork(activeArtwork - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); displayArtwork(activeArtwork + 1); }
});
document.querySelector('#open-contact').addEventListener('click', () => openDialog(document.querySelector('#contact-dialog')));
document.querySelector('#inquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = String(form.get('message') || '').trim();
  const input = document.querySelector('#inquiry-text');
  input.setCustomValidity(message ? '' : 'ご相談内容を入力してください。');
  if (!input.reportValidity()) return;
  const name = String(form.get('name') || '').trim() || '未記入';
  document.querySelector('#inquiry-output').value = `futurへのご相談\n\nお名前・会社名：${name}\nご相談の種類：${form.get('type')}\n\nご相談内容：\n${message}`;
  document.querySelector('#inquiry-result').hidden = false;
  document.querySelector('#copy-status').textContent = '相談メモを作成しました。内容を確認し、コピーまたは保存してください。';
  document.querySelector('#inquiry-output').focus();
});
document.querySelector('#inquiry-text').addEventListener('input', event => event.target.setCustomValidity(''));
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const output = document.querySelector('#inquiry-output');
  try {
    await navigator.clipboard.writeText(output.value);
    document.querySelector('#copy-status').textContent = 'コピーしました。メールやチャットに貼り付けてお使いください。';
  } catch {
    output.focus(); output.select();
    document.querySelector('#copy-status').textContent = 'テキストを選択しました。端末のコピー操作でコピーしてください。';
  }
});
document.querySelector('#download-inquiry').addEventListener('click', () => {
  const blob = new Blob([document.querySelector('#inquiry-output').value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'futur-inquiry.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
