/**
 * 语音合成服务
 * 使用Web Speech API实现简单的文本转语音功能
 */

// 检查浏览器是否支持Web Speech API
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// 获取可用的语音
export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};

// 将文本转换为语音
export const speak = (text: string, voiceName?: string, rate: number = 1, pitch: number = 1): void => {
  if (!isSpeechSynthesisSupported()) {
    console.error('当前浏览器不支持语音合成API');
    return;
  }

  // 停止当前正在播放的语音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // 设置语音参数
  utterance.rate = rate; // 语速 (0.1 到 10)
  utterance.pitch = pitch; // 音调 (0 到 2)
  
  // 如果指定了语音名称，则设置对应的语音
  if (voiceName) {
    const voices = getVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      utterance.voice = voice;
    }
  }
  
  // 设置语言为中文
  utterance.lang = 'zh-CN';
  
  // 播放语音
  window.speechSynthesis.speak(utterance);
};

// 停止语音播放
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

// 检查是否正在播放语音
export const isSpeaking = (): boolean => {
  if (isSpeechSynthesisSupported()) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

// 语音导览内容数据
export const voiceGuideContents = {
  1: `青龙湾历史可以追溯到明朝初期，当时这里是重要的水路交通枢纽。青龙湾因形似蜿蜒盘旋的青龙而得名，湾区水域开阔，风景秀丽，自古以来就是文人墨客吟咏的胜地。明清时期，这里商贾云集，是徽商的重要聚集地之一，为徽州文化的发展做出了重要贡献。`,
  2: `徽派建筑是中国传统建筑的重要流派，以"三雕（木雕、石雕、砖雕）"、"三绝（徽墨、徽菜、徽剧）"闻名于世。徽派建筑的特点是马头墙高耸，飞檐翘角，雕梁画栋，布局严谨，讲究对称。青龙湾地区的徽派建筑保存完好，是研究徽州文化的重要实物资料。`,
  3: `青龙湾生态系统非常丰富，有多种珍稀动植物。湾区水质清澈，水生植物繁多，是多种鱼类和水禽的栖息地。周边山林茂密，植被覆盖率高，形成了良好的生态屏障。当地政府近年来加强了生态保护力度，实施了一系列环境治理措施，使青龙湾的生态环境得到了有效改善。`,
  4: `青龙湾地区的民俗文化丰富多彩，包括徽州婚俗、祭祀礼仪、传统节庆等。当地的手工艺也非常发达，如徽墨制作、木雕、竹编等。此外，徽州菜是中国八大菜系之一，以烹饪技艺精湛、注重原料鲜活、口味醇厚著称。每年农历二月初二，当地还会举办传统的"龙抬头"民俗活动，祈求丰收和平安。`
}; 