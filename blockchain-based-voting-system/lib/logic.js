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
  const documentId=document.getIdentifier();
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
      document.texte=document.texte.substring(0, maj.debutModification) + maj.chaineInseree + document.texte.substring(maj.finModification);
    document.nbCaracteres=document.nbCaracteres-(maj.finModification-maj.debutModification)+maj.chaineInseree.length;
  }
  //Mettre à jour le registre du document
  //Début démarrer vote
  var nbOui=0; // nombre de oui
  var nbNon=0; // nombre de non
  //On détermine la liste des votants

  /* On traite les différentes réponses des clients */

  for(var i=0;i<maj.listeVotants.length; i++){
	  var correct=false; // la réponse est-elle correcte?
      var cur_votant=maj.listeVotants[i];
      var fenetre_contributeur=open("",i,""); //on ouvre une page pour demander à l'utilisateur de s'authentifier
	  while(!correct){
 		  var choix = fenetre_contributeur.prompt("Bonjour "+cur_votant.utilisateurId+". Validez (OUI) ou refusez (NON) la modification");
  		 if(choix!="OUI" && choix !="NON"){
    		alert("OUI et NON seules réponses valides; veuillez entrer une réponse");
  			}
  		 if(choix=="OUI"){
    		correct=true;
    		nbOui++;
            fenetre_contributeur.close();
            }
  		 if(choix=="NON"){
   		 correct=true;
   		 nbNon++;
         fenetre_contributeur.close();
         }
		}
}
  //On créer l'evènement DocumentModification
  let documentModificationEvent = getFactory().newEvent(NS, 'documentModification');
  documentModificationEvent.resultat=false; // par défaut pour faciliter les vérifications
  documentModificationEvent.protocoleVote=maj.protocoleVote;
/* On fait le bilan des résulats des demarrerVotes
*si le protocole est majorité, on vérifie que nbOui>nbNon
* sinon que nbNon est égal à 0
*/
  if(maj.protocoleVote=="MAJORITE"){
    if(nbOui>nbNon){
      documentModificationEvent.resultat=true;
  }
  }
  if(maj.protocoleVote=="UNANIMITE"){
    if(nbNon==0){
      documentModificationEvent.resultat=true;
  }
}
  /* On ne met à jour le registre que si le résultat du vote l'autorise
  * Si la modification est refusée, on garde quand même une trace
  */

  if(documentModificationEvent.resultat==true){
  await documentRegistry.update(document);
  }
  documentModificationEvent.documentId=document.getIdentifier();
  documentModificationEvent.utilisateurId=contributeurId;
  documentModificationEvent.chaineRemplacee=chaineRemplacee;
  documentModificationEvent.chaineInseree=maj.chaineInseree;

  //On publie l'évènement
  emit(documentModificationEvent);

  // Pouvoir créer le vote
  var finalTimeStamp = new Date;
}
