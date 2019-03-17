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
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  //Get participant registry for Utilisateurs
  const utilisateurRegistry = await getParticipantRegistry(NS + '.Utilisateur');

  const document = await documentRegistry.get(tx.document.getIdentifier());
  //On s'assure que le document existe
  if(!document){
    throw new Error('Le document avec l'Id $document.getIdentifier()} n'existe pas');
  }
  //Récupération de l'id du contributeur
  const contributeurId=tx.utilisateurModifiant.getIdentifier();
  //On s'assure que le contributeur existe
  const contributeur= await utilisateurRegistry.get(contributeurId);
  if (!contributeur){
    throw new Error ('L\'utilisateur avec l'Id ${contributeurId} dn'existe pas');
  }
  //Maintenant on modifie le document
  const chaineRemplacee=document.texte.substring(tx.debutModification, tx.finModification);
  if (tx.debutModification == tx.finModification){
    document.texte=document.texte.substring(0, tx.debutModification) + tx.chaineInseree + document.texte.substring(tx.debutModification);
  }
  else {
      document.texte=document.texte.substring(0, tx.debutModification) + document.texte.substring(tx.finModification);
      document.texte=document.texte.substring(0, tx.debutModification) + tx.chaineInseree + document.texte.substring(tx.debutModification);
  }
  //Mettre à jour le registre du document
  await documentRegistry.update(tx.document);

  //On créer l'evènement DocumentModification
  let documentModificationEvent = getFactory().newEvent(NS, 'DocumentModification');
  documentModificationEvent.documentId=document.documentId;
  documentModificationEvent.utilisateurId=contributeurId;
  documentModificationEvent.chaineRemplace=chaineRemplacee;
  documentModificationEvent.chaineInseree=tx.chaineInseree;

  //On publie l'évènement
  emit(documentModificationEvent);
}
