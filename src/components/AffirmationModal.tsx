import React from 'react'
import { X, Sparkles, Heart, Share2, Copy, Check, ImageDown } from 'lucide-react'
import { downloadAffirmationCard } from '../lib/cardImage'
import { Affirmation } from '../lib/affirmations'
import { Language, translations } from '../lib/i18n'
import { toast } from 'sonner'

interface AffirmationModalProps {
  isOpen: boolean
  onClose: () => void
  affirmations: Affirmation[]
  lang?: Language
}

export function AffirmationModal({
  isOpen,
  onClose,
  affirmations,
  lang = 'ko',
}: AffirmationModalProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const t = translations[lang]

  if (!isOpen) return null

  const handleCopy = (item: Affirmation) => {
    const text = lang === 'en' && item.textEn ? item.textEn : item.text
    const subtext =
      lang === 'en' && item.subtextEn
        ? item.subtextEn
        : item.subtext || t.affirmationFrom
    const textToCopy = `"${text}" - ${subtext}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id)
      toast.success(t.copiedToast)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleSaveImage = async (item: Affirmation) => {
    const text = lang === 'en' && item.textEn ? item.textEn : item.text
    const subtext = lang === 'en' && item.subtextEn ? item.subtextEn : item.subtext
    const ok = await downloadAffirmationCard(text, subtext, t.siteTitle)
    if (ok) toast.success(t.cardSavedToast)
    else toast.error(t.cardSaveFailedToast)
  }

  const handleShareAll = () => {
    if (navigator.share) {
      navigator
        .share({
          title: t.sharePeaceTitle,
          text: t.sharePeaceText,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success(t.sharePeaceToast)
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white/95 dark:bg-zinc-900/95 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                {t.affirmationModalTitle}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.affirmationModalSubtitle(affirmations.length)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={t.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {affirmations.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40 animate-pulse" />
              <p className="text-sm font-medium">{t.emptyAffirmationsTitle}</p>
              <p className="text-xs mt-1 text-stone-400">
                {t.emptyAffirmationsDesc}
              </p>
            </div>
          ) : (
            affirmations.map((item, idx) => {
              const itemText =
                lang === 'en' && item.textEn ? item.textEn : item.text
              const itemSubtext =
                lang === 'en' && item.subtextEn ? item.subtextEn : item.subtext

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="group p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-emerald-100/80 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-100 leading-snug">
                      "{itemText}"
                    </p>
                    {itemSubtext && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                        {itemSubtext}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSaveImage(item)}
                    className="p-2 rounded-xl text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                    title={t.saveCardTitle}
                    aria-label={t.saveCardTitle}
                  >
                    <ImageDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-2 rounded-xl text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                    title={t.copyAffirmationTitle}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={handleShareAll}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.sharePeaceBtn}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
