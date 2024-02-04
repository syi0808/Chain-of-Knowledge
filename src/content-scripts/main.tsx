import { createIDB } from '../background/utils/indexedDb';

document.addEventListener('selectionchange', async (e) => {
  console.log(e);

  const indexedDB = await createIDB();

  indexedDB.get();
});
