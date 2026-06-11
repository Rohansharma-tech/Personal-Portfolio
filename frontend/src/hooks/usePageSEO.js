import { useEffect } from 'react'

const BASE_TITLE = 'Rohan Sharma | Full Stack Developer'
const BASE_DESCRIPTION =
  'Full Stack Developer specializing in Django, React, and PostgreSQL. Building scalable backends and modern web applications. Open to work — based in India.'

/**
 * usePageSEO — updates document title and meta description per page.
 *
 * @param {object} options
 * @param {string} [options.title]       Page-specific title. Appended as "Title | Rohan Sharma"
 * @param {string} [options.description] Page-specific meta description.
 */
export function usePageSEO({ title, description } = {}) {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | Rohan Sharma` : BASE_TITLE

    // Meta description
    const desc = description || BASE_DESCRIPTION
    let metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', desc)
    }

    // OG title + description
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc  = document.querySelector('meta[property="og:description"]')
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    const twDesc  = document.querySelector('meta[name="twitter:description"]')

    if (ogTitle) ogTitle.setAttribute('content', document.title)
    if (ogDesc)  ogDesc.setAttribute('content', desc)
    if (twTitle) twTitle.setAttribute('content', document.title)
    if (twDesc)  twDesc.setAttribute('content', desc)

    // Reset on unmount
    return () => {
      document.title = BASE_TITLE
      if (metaDesc) metaDesc.setAttribute('content', BASE_DESCRIPTION)
      if (ogTitle) ogTitle.setAttribute('content', BASE_TITLE)
      if (ogDesc)  ogDesc.setAttribute('content', BASE_DESCRIPTION)
      if (twTitle) twTitle.setAttribute('content', BASE_TITLE)
      if (twDesc)  twDesc.setAttribute('content', BASE_DESCRIPTION)
    }
  }, [title, description])
}
