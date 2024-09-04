

function topicCheck(topic,res){
    const currentTopics = ['walkthrough','review','talks']
    const formattedTopic = topic.toLowerCase()

    if(currentTopics.includes(formattedTopic)){
        return formattedTopic
    }else{
        return null
    }
}
module.exports = topicCheck