export default {
    state: {
        videoPlayer: {
            visible: false,  //  查看组件显隐状态
            url: '',
            filename: '',
        },
        isPlaying: false
    },
    mutations: {
        setVideoReviewData(state, data) {
            state.videoPlayer.visible = data.visible
            state.videoPlayer.url = data.url
            state.videoPlayer.filename = data.filename
        },
        setVideoPlayMin(state){
            state.videoPlayer.visible = false
        },
        setVideoPlayNormal(state){
          state.videoPlayer.visible = true
        },
        closeVideoPlay(state){
            state.videoPlayer = {
                visible: false,
                url: '',
                filename: '',
            }
        },
        setPlaying(state, data){
            state.isPlaying = data
        }
    },
    actions: {
    }
}
