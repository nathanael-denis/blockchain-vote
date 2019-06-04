'use strict';
/**
* Defining the namespace for the blockchain-based voting system
*/

const NS='org.vote';

/**
*Ajoute le document auquel contribue l'utilisateur à la liste des documents
*@param {org.vote.utilisateurContribueAuDocument} couple  - prend le couple utilisateur/document en paramètre
*@transaction
*/

async function utilisateurContribueAuDocument(couple){
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  const utilisateurRegistry = await getParticipantRegistry(NS + '.Utilisateur');
  const document = await documentRegistry.get(couple.doc.getIdentifier());
  const contributeur= await utilisateurRegistry.get(couple.nouveauContributeur.getIdentifier());
  contributeur.documentsModifiables.push(document);
  utilisateurRegistry.update(contributeur);
    //On créer l'evènement associé à l'ajout
  let nouveauContributeurEvent = getFactory().newEvent(NS, 'nouveauContributeur');
  nouveauContributeurEvent.doc=couple.doc;
  nouveauContributeurEvent.nouveauContributeur=couple.nouveauContributeur;

  //On publie l'évènement
  emit(nouveauContributeurEvent);

}
/**
*Rajoute la modification à la version précédente du texte
*@param {org.vote.modifierDocument} maj - La mise a jour du document
*@transaction
*/


async function modifierDocument(maj){

  //Get asset registry for Document
  var firstTimeStamp= new Date();
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  //Get participant registry for Utilisateurs
  const utilisateurRegistry = await getParticipantRegistry(NS + '.Utilisateur');
  const document = await documentRegistry.get(maj.documentModifie.getIdentifier());
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
    document.texte=document.texte.substring(0, maj.debutModification) + maj.chaineInseree +       document.texte.substring(maj.debutModification);
    // Il faut mettre à jour le nombre de caractères
    document.nbCaracteres+=maj.chaineInseree.length;
  }
  else {
      document.texte=document.texte.substring(0, maj.debutModification) + document.texte.substring(maj.finModification);
      document.texte=document.texte.substring(0, maj.debutModification) + maj.chaineInseree + document.texte.substring(maj.debutModification);
  }
  //Mettre à jour le registre du document
  await documentRegistry.update(document);

  //On créer l'evènement DocumentModification
  let documentModificationEvent = getFactory().newEvent(NS, 'documentModification');
  documentModificationEvent.documentId=document.getIdentifier();
  documentModificationEvent.utilisateurId=contributeurId;
  documentModificationEvent.chaineRemplacee=chaineRemplacee;
  documentModificationEvent.chaineInseree=maj.chaineInseree;

  //On publie l'évènement
  emit(documentModificationEvent);

  // 7) Appeler les votants pour lancer les votes
  // Pouvoir créer le vote
  var finalTimeStamp = new Date;
  //var result = finalTimeStamp--firstTimeStamp;
}

/**
*Lance le protocole de vote après la demande de l'utilisateur
*@param {org.vote.demarrerVotes} vote - Le vote
*@transaction
*/

async function demarrerVotes(vote){
  const documentRegistry = await getAssetRegistry(NS + '.Document');
  const document = await documentRegistry.get(vote.documentId);
  //On s'assure que le document existe
  if(!document){
    throw new Error('Le document avec l\'Id $document.getIdentifier()} n\'existe pas');
  }
  // On s'assure que l'utilisateur a les droits
  var nbOui=0; // nombre de oui
  var nbNon=0; // nombre de non
  /* On traite les différentes réponses des clients */
  for(var i=0;i<vote.listeVotants.length; i++){
	  var correct=false; // la réponse est-elle correcte?
	  while(!correct){
 		 var choix = prompt("Validez (OUI) ou refusez (NON) la modification");
		 alert(choix);
  		 if(choix!="OUI" && choix !="NON"){
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
  let voteTermineEvent = getFactory().newEvent(NS, 'voteTermine');
  voteTermineEvent.resultat=false; // par défaut pour faciliter les vérifications
  voteTermineEvent.protocoleVote=vote.protocoleVote;
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
