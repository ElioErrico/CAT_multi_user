import { usePlugins } from '@stores/usePlugins'
import { useRabbitHole } from '@stores/useRabbitHole'
import { AcceptedMemoryTypes, AcceptedPluginTypes } from 'ccat-api'
import { getSavedUsername } from '@/composables/helpers'

const { installPlugin } = usePlugins()
const { sendFile, sendMemory, sendWebsite, getAllowedMimetypes } = useRabbitHole()

/**
 * A composable method to upload file to the Rabbit Hole based on file type
 * @param category The type of file who is going to ask for in the file dialog box
 */
export function uploadContent() {
	const upload = async (
	  category: 'memory' | 'content' | 'web' | 'plugin' | 'contract',
	  data?: File | string
	) => {
	  const { open: openDialog, onChange: onFileUpload } = useFileDialog()
  
	  const allowedMimetypes: string[] = []
  
	  // Funzioni di invio in base alla categoria
	  const sendContent = category == 'plugin'
		? installPlugin
		: category == 'memory'
		? sendMemory
		: sendFile
  
	  onFileUpload(async files => {
		if (files == null) return
  
		// Se la categoria è contract, controlliamo che l'utente sia loggato
		if (category === 'contract') {
		  const username = getSavedUsername()
		  if (!username) {
			alert('Per allegare un file è necessario essere loggati.')
			return
		  }
  
		  for (const file of files) {
			// Verifica se il MIME type è tra quelli permessi
			if (!allowedMimetypes.includes(file.type)) continue
  
			// Se il file è .doc o .docx, lo rinominiamo
			const lowerName = file.name.toLowerCase()
			if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
			  // Rimuoviamo l'estensione originale
			  const baseName = file.name.replace(/\.(docx|doc)$/i, '')
			  // Creiamo il nuovo nome con username + .docx
			  const newName = `${baseName}_${username}.docx`
			  // Creiamo un nuovo File col nome modificato
			  const fileToUpload = new File([file], newName, { type: file.type })
			  // Invio
			  await sendContent(fileToUpload)
			} else {
			  // Se non è .doc/.docx ma comunque è permesso, inviamo direttamente
			  await sendContent(file)
			}
		  }
		} else {
		  // Per tutte le altre categorie, logica originale
		  for (const file of files) {
			if (!allowedMimetypes.includes(file.type)) continue
			await sendContent(file)
		  }
		}
	  })
  
	  // Costruzione lista MIME consentiti
	  if (category == 'memory') {
		allowedMimetypes.push(...AcceptedMemoryTypes)
	  } else if (category == 'plugin') {
		allowedMimetypes.push(...AcceptedPluginTypes)
	  } else if (category == 'content') {
		const mimetypes = (await getAllowedMimetypes()) ?? []
		allowedMimetypes.push(...mimetypes)
	  } else if (category === 'contract') {
		// Aggiunta tipi MIME per i file .doc e .docx
		const contractMimetypes = [
		  'application/msword',
		  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		]
		allowedMimetypes.push(...contractMimetypes)
	  }
  
	  // Logica "upload" in base al tipo di contenuto
	  if (category == 'web' && typeof data == 'string') {
		sendWebsite(data)
	  } else if (data instanceof File && allowedMimetypes.includes(data.type)) {
		// Se l’input è direttamente un file
		if (category === 'contract') {
		  // Ripetiamo la logica di rinomina se arrivasse un file direttamente come parametro
		  const username = getSavedUsername()
		  if (!username) {
			alert('Per allegare un file è necessario essere loggati.')
			return
		  }
		  const lowerName = data.name.toLowerCase()
		  if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
			const baseName = data.name.replace(/\.(docx|doc)$/i, '')
			const newName = `${baseName}_${username}.docx`
			const fileToUpload = new File([data], newName, { type: data.type })
			sendContent(fileToUpload)
		  } else {
			sendContent(data)
		  }
		} else {
		  // Per le altre categorie, invio diretto
		  sendContent(data)
		}
	  } else if (category != 'web' && typeof data == 'string') {
		// Crea un file testuale "fittizio" da stringa
		sendContent(new File([new Blob([data])], category, { type: 'text/plain' }))
	  } else {
		// Apri dialog per selezionare il file se non è già stato fornito
		openDialog({ accept: allowedMimetypes.join(',') })
	  }
	}
  
	return { upload }
  }
