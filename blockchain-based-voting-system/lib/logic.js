'use strict';
/**
* Defining the namespace for the blockchain-based voting system
*/

const NS='org.vote';
/**
*Rajoute la modification à la version précédente du texte
*@param {org.vote.ModifierDocument} tx - La mise a jour du document
*@transaction
*/

async function ModifierDocument(tx){

  //Get asset registry for Document
  const registreDocument = await getAssetRegistry(NS + '.Document');
  //Get participant registry for Utilisateurs
  const registreUtilisateur = await getParticipantRegistry(NS + '.Utilisateur');

  const document = await registreDocument.get(tx.document.getIdentifier());
  //On s'assure que le document existe
  if(!document){
    throw new Error('Document avec l'Id $ocument.getIdentifier()} n'existe pas');
    
  }
}
