'use strict';
/**
* Defining the namespace for the blockchain-based voting system
*/

const NS='org.vote';
/**
*Rajoute la modification à la version précédente du texte
*@param {org.vote.modifierDocument} maj - La mise a jour du document
*@transaction
*/
async function modifierDocument(maj){

  //Get asset registry for Document
  var firstTimeStamp= new Date().getTime;
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  //Get participant registry for Utilisateurs
  const utilisateurRegistry = await getParticipantRegistry(NS + '.Utilisateur');

  const document = await documentRegistry.get(maj.document.getIdentifier());
  //On s'assure que le document existe
  if(!document){
    throw new Error('Le document avec l\'Id $document.getIdentifier()} n\'existe pas');
  }
  //Récupération de l'id du contributeur
  const contributeurId=maj.utilisateurModifiant.getIdentifier();
  //On s'assure que le contributeur existe
  const contributeur= await utilisateurRegistry.get(contributeurId);
  if (!contributeur){
    throw new Error ('L\'utilisateur avec l\'Id ${contributeurId} dn\'existe pas');
  }
  //Maintenant on modifie le document
  const chaineRemplacee=document.texte.substring(maj.debutModification, maj.finModification);
  if (maj.debutModification == maj.finModification){
    document.texte=document.texte.substring(0, maj.debutModification) + maj.chaineInseree + document.texte.substring(maj.debutModification);
  }
  else {
      document.texte=document.texte.substring(0, maj.debutModification) + document.texte.substring(maj.finModification);
      document.texte=document.texte.substring(0, maj.debutModification) + maj.chaineInseree + document.texte.substring(maj.debutModification);
  }
  //Mettre à jour le registre du document
  await documentRegistry.update(maj.document);

  //On créer l'evènement DocumentModification
  let documentModificationEvent = getFactory().newEvent(NS, 'DocumentModification');
  documentModificationEvent.documentId=document.documentId;
  documentModificationEvent.utilisateurId=contributeurId;
  documentModificationEvent.chaineRemplacee=chaineRemplacee;
  documentModificationEvent.chaineInseree=maj.chaineInseree;

  //On publie l'évènement
  emit(documentModificationEvent);

  // 7) Appeler les votants pour lancer les votes

  var finaltimeStamp = new Date.getTime();
  var result = finaltimeStamp--firstTimeStamp;

}

/**
*Rajoute la modification à la version précédente du texte
*@param {org.vote.demarrerVotes} maj - La mise a jour du document
*@transaction
*/
async function demarrerVotes(maj){}
