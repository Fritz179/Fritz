// app\testing\app3, app\testing\v5, !libraries, !app\testing\app3\old
// !app\testing\v5\old, app\testing\app3, app\testing\v5, !libraries, !app\testing\app3\old

// Block al ga [x, y, w, h] e funzion par al moa [setPos, setSize, setRight, left, bottom]

// Frame al ga [xm, ym, cahnged(_posChanged)] e funzion cuma [update, getSprite, onKey, onMouse]
// glien li robi in cümün tra entity e layer
// al ga xm e ym par getMouse par calcula la pusizion

// Body al ga [xv, xa, xd, movingFor] e funnzion [setVel, setDrag, fixedUpdate => fisica] cun flag [autoMove]
// al ga la fisica e muiment

// Entity al ga [spriteDir, spriteAction, spriteFrame, cahnged(_spriteChanged)] e [getSprite]
// Le tüt par li sprite

// Context al ga getContext('2d') e funzion par disegna in modu plü semplice
// al ten li funzion par disegana
// al ottimizza la image (rImage)

// Canvas al ga al ver [xm, ym] e al ga un Context sa le an buffer
// sa ctx al pünta a un altru canvas le an livel sota (recursion)
// al dupera multiply par meta li cordinadi e grandezzi apost
// forsi al ga volarof naltra clas car an buffer (cun multiply ma miga na canvas?)


// Layer al ga dai children e al preSprite par met al ctx sa al ga miga al buffer
// SpriteLayer updaita tüc i childre, fixedUpdate da sa moa e collision

// Changed le la flag ca la dis ca al layer le cambiu
// sa al ven ciamu getSprite al ven ciamu al vol di ca an fradel le cambiu
// e al pa la da ricostrüi tüt
// sa al layer al ga miga an layer la da ridisegna tüc i fiöi sul ctx dal pa
// sa al ga an buffer e le miga cambiu al po da al buffer al pa
// sa al ga an buffer e le cambiu la da ridisegna tüc i fiöi e da al buffer al pa
// changed al po esa resettu noma dopu ave ciamu al getSprite, dopu ave disegnu tüt

// App.js al crea al Timer, al sculta par resize

//Helper.js al ga al preloadCounter, loadImage, loadJSON, capitalize, getColor, addDefaultOptions

// cuma fa par layers...
// Layers al ga tanct layer in cui al met i fiöi, al ga an map ca al ga dis a che livel ca le
// al ga an forEach ca al fa pasa tüt

// TileGame al ga chunkWidth/height, tileSize, chunks e collisionTable,
// li sprie gline in dali sprites
// al ga anca funzion cuma getTileAt, collideMap, setChunkAt

// Chuk le an canvas ca al buffera tüc i diseign, al cambia noma i necesari
// i blöc cun animazion le amo da decida sa i salva nal chunk o nal TileGame
// parchi i gan an sfondo trasparent?

// temp
// dove vegnial salvu i blöc cun animazion?


// TODO: cambia al _isMap cun i addPre ca i agiungian properties al args
// ca i vegnian ciamai da default nal realFun o da quela dal utente

// funzion par disegnà cun an oggetto? tipu an per default po an args?
// image(img, x, y, w, h)
