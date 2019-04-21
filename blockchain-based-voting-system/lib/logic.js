'use strict';
/**
* Defining the namespace for the blockchain-based voting system
*/

const NS='org.vote';
/**
*Rajoute la modification à la version précédente du texte
*@param {org.vote.modifierDocument} maj - La mise a jour du document
*@transaction
j*/
async function modifierDocument(maj){ // vérifier async pour cette fonction

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
  const contributeur=await utilisateurRegistry.get(contributeurId);
  if (!contributeur){
    throw new Error('L\'utilisateur avec l\'Id ${contributeurId} dn\'existe pas');
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
  // Pouvoir créer le vote
  var finalTimeStamp = new Date.getTime();
  //var result = finalTimeStamp--firstTimeStamp;
}

/**
*Lance le protocole de vote après la demande de l'utilisateur
*@param {org.vote.demarrerVotes} vote - Le vote
*@transaction
*/

async function demarrerVotes(vote){
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  const document = await documentRegistry.get(vote.document.getIdentifier());
  //On s'assure que le document existe
  if(!document){
    throw new Error('Le document avec l\'Id $document.getIdentifier()} n\'existe pas');
  }
  // On s'assure que l'utilisateur a les droits
  var nbOui=0; // nombre de oui
  var nbNon=0; // nombre de non
  /* On traite les différentes réponses des clients */
  for(var i=0;n = vote.listeVotants.length; i++){
  var correct=false; // la réponse est-elle correcte?
  while(!correct){
  var choix = prompt("Validez (OUI) ou refusez (NON) la modification");
  if(choix!="OUI" || choix !="NON"){
    alert("OUI et NON seules réponses valides; veuillez entrer une réponse");
  }
  if(choix=="OUI"){
    correct=true;
    nbOui++;
  }
  if(choix=="NON"){
    correct=true;
    nbNon++;
  }
}
}
let voteTermineEvent = getFactory().newEvent(NS, 'protocoleVote');
voteTermineEvent.resultat=false; // par défaut pour faciliter les vérifications
voteTermineEvent.protocoleVote=vote.protocoleVote
voteTermineEvent.documentId=vote.documentId;
/* On fait le bilan des résulats des demarrerVotes
*si le protocole est majorité, on vérifie que nbOui>nbNon
* sinon que nbNon est égal à 0
*/
if(vote.protocoleVote=="MAJORITE"){
  if(nbOui>nbNon){
    voteTermineEvent.resultat=true;
  }
}
if(vote.protocoleVote=="UNANIMITE"){
  if(nbNon==0){
    voteTermineEvent.resultat=true;
  }
}
emit(voteTermineEvent);
}
