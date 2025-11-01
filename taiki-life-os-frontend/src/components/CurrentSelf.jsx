import { useState } from 'react'
import { ChevronDown, ChevronRight, User, Heart, Compass, Brain, Star, Zap } from 'lucide-react'

const currentSelfData = [
  {
    id: 'values-philosophy',
    title: '価値観＆理念の整理',
    icon: Heart,
    color: 'text-rose-600',
    content: {
      coreValues: [
        { name: '熱狂（エネルギー・情熱）', description: '人と人が交わることで生まれる熱狂、新しい体験を通じたワクワク' },
        { name: '成長（知識・経験）', description: '常にGrowth Zoneにいたい、挑戦する環境を求める' },
        { name: '自由（自己決定権）', description: '誰かに縛られず、自分の選択で生きる' },
        { name: '誠実さ（信頼・倫理）', description: '人間味のある行動を重視、堅実で信頼できる存在になる' }
      ],
      middleValues: [
        { name: '影響力（社会貢献・リーダーシップ）', description: '人にポジティブな変化をもたらす、コミュニティを活性化させる' },
        { name: '冒険（新規事業・未知の世界）', description: '最先端のテクノロジーに触れる、未知の領域に挑戦し続ける' },
        { name: '仲間（協力・共創）', description: '持続可能なコミュニティを作る、熱量の高い人と共に働く' }
      ]
    }
  },
  {
    id: 'mission-role',
    title: '役割・使命',
    icon: Compass,
    color: 'text-indigo-600',
    content: {
      soulMission: '「いにしえの水の問いを捧げし者、神の島にて導きを得る者。神の問いを詩として刻み、三界に祈る巫（うたかんなぎ）」',
      modernRoles: [
        { role: '境界をつなぐ者', description: '現・幽・神、リアルとデジタル、個と集団、理性と感性の橋渡し' },
        { role: '言葉なきものをすくい上げる者', description: '沈黙、違和感、感情、祈り…まだ言語化されていない「声」を掬いあげる' },
        { role: '祈りのかたちを遺す者', description: '世界観・思想・体験を"熱狂"という形で伝え、「人の魂に火を灯す」' },
        { role: '導き手に徹する者', description: '主役にならず、"熱狂"を起こす人々を照らす存在' }
      ],
      essence: '熱狂と祈りをデザインする導き手 ― 忘れられた問いを現代に蘇らせ、人と世界をつなぐ存在'
    }
  },
  {
    id: 'personality',
    title: '性格診断',
    icon: Brain,
    color: 'text-purple-600',
    content: {
      mbti: {
        type: 'ENTP（討論者型）',
        description: 'アイデアマンで、常に「何か新しいこと」を考えている。論理的で頭の回転が早く、議論やディベートを楽しむ。',
        strengths: ['創造力', '柔軟性', 'コミュニケーション力', '問題解決'],
        challenges: ['飽きやすさ', '過剰な自己主張', '感情への鈍感さ']
      },
      animalType: {
        type: '束縛を嫌う黒豹',
        description: 'クール＆スマートな野心家。人に媚びず、合理的で洗練された判断を好む。スピード重視で考えるより先に動くタイプ。',
        traits: ['群れない、でも一目置かれたい', 'カリスマ性があり、背中で引っ張るタイプ', '直感×論理のバランス型']
      },
      numerology: {
        type: '運命数 1（リーダー／開拓者）',
        theme: '誰も歩んでいない道を切り開く',
        strengths: ['意志の強さとブレない信念', '圧倒的な行動力とエネルギー', '他人に流されず、自分の道を突き進むリーダー気質'],
        weaknesses: ['頑固になりやすい', '孤独を感じやすい', '他者に任せるのが苦手']
      }
    }
  }
]

export default function CurrentSelf() {
  const [expandedSections, setExpandedSections] = useState({})
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌟 現在の三島大毅
        </h1>
        <p className="text-gray-600">
          自己理解を深め、本質的な強みと使命を明確にする
        </p>
      </div>
      
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-3">総合タイプ名</h2>
        <p className="text-lg font-medium mb-2">「独立自尊の革新家」</p>
        <p className="text-indigo-100">
          誰もやったことのないことを仕組みで実現する異端のプロデューサー
        </p>
      </div>
      
      {/* Detailed Sections */}
      <div className="space-y-4">
        {currentSelfData.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.id]
          
          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <h2 className="text-lg font-semibold text-gray-900 text-left">
                    {section.title}
                  </h2>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6">
                  {section.id === 'values-philosophy' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          コア価値観（最優先・人生の基盤）
                        </h3>
                        <div className="space-y-3">
                          {section.content.coreValues.map((value, index) => (
                            <div key={index} className="border-l-4 border-red-400 pl-4 bg-red-50 p-3 rounded-r">
                              <h4 className="font-medium text-red-900">{value.name}</h4>
                              <p className="text-red-700 text-sm">{value.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          ミドル価値観（重要だが調整可能）
                        </h3>
                        <div className="space-y-3">
                          {section.content.middleValues.map((value, index) => (
                            <div key={index} className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r">
                              <h4 className="font-medium text-orange-900">{value.name}</h4>
                              <p className="text-orange-700 text-sm">{value.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {section.id === 'mission-role' && (
                    <div className="space-y-6">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-900 mb-2">魂の使命</h3>
                        <p className="text-indigo-800 italic">{section.content.soulMission}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">現代における役目・使命</h3>
                        <div className="space-y-3">
                          {section.content.modernRoles.map((role, index) => (
                            <div key={index} className="border-l-4 border-indigo-400 pl-4">
                              <h4 className="font-medium text-indigo-900">{role.role}</h4>
                              <p className="text-gray-700 text-sm">{role.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-900 mb-2">本質</h3>
                        <p className="text-indigo-800 font-medium">{section.content.essence}</p>
                      </div>
                    </div>
                  )}
                  
                  {section.id === 'personality' && (
                    <div className="space-y-6">
                      {/* MBTI */}
                      <div className="border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-900 mb-2">
                          MBTI: {section.content.mbti.type}
                        </h3>
                        <p className="text-gray-700 mb-3">{section.content.mbti.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">強み</h4>
                            <ul className="space-y-1">
                              {section.content.mbti.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-700 mb-2">課題</h4>
                            <ul className="space-y-1">
                              {section.content.mbti.challenges.map((challenge, index) => (
                                <li key={index} className="text-sm text-orange-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Animal Type */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          動物占い: {section.content.animalType.type}
                        </h3>
                        <p className="text-gray-700 mb-3">{section.content.animalType.description}</p>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">特徴</h4>
                          <ul className="space-y-1">
                            {section.content.animalType.traits.map((trait, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                {trait}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Numerology */}
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          数秘術: {section.content.numerology.type}
                        </h3>
                        <p className="text-blue-700 font-medium mb-3">テーマ: {section.content.numerology.theme}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">強み</h4>
                            <ul className="space-y-1">
                              {section.content.numerology.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">弱点</h4>
                            <ul className="space-y-1">
                              {section.content.numerology.weaknesses.map((weakness, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Self PR */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">自己PR</h2>
        <blockquote className="text-purple-800 italic leading-relaxed">
          私は「発想力」と「突破力」で、新しい価値を社会に生み出すことを志す人間です。
          議論や挑戦を好み、常に"もっと良くできないか"を問い続けながら行動しています。
          自分の信じる理想を貫く一方で、人との共創によって世界観を形にする「柔軟な強さ」も大切にしています。
        </blockquote>
      </div>
    </div>
  )
}

