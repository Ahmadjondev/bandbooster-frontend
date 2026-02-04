import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Scrolls to a specific element within a scrollable container.
 * Unlike scrollIntoView(), this only scrolls the target container,
 * not the window or any parent scroll containers.
 * 
 * @param container - The scrollable container element
 * @param element - The target element to scroll to
 * @param options - Scroll options
 */
export function scrollToElementInContainer(
  container: HTMLElement | null,
  element: HTMLElement | null,
  options: {
    behavior?: ScrollBehavior;
    block?: 'start' | 'center' | 'end';
    offset?: number;
  } = {}
): void {
  if (!container || !element) return;

  const { behavior = 'smooth', block = 'center', offset = 0 } = options;

  // Get the element's position relative to the container
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // Calculate the element's offset from the container's scroll position
  const elementOffsetTop = elementRect.top - containerRect.top + container.scrollTop;
  const elementHeight = element.offsetHeight;
  const containerHeight = container.clientHeight;

  let scrollTop: number;

  switch (block) {
    case 'start':
      scrollTop = elementOffsetTop - offset;
      break;
    case 'end':
      scrollTop = elementOffsetTop - containerHeight + elementHeight + offset;
      break;
    case 'center':
    default:
      scrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2) + offset;
      break;
  }

  // Clamp scroll position to valid range
  const maxScroll = container.scrollHeight - containerHeight;
  scrollTop = Math.max(0, Math.min(scrollTop, maxScroll));

  container.scrollTo({
    top: scrollTop,
    behavior,
  });
}

/**
 * Scrolls to a question element within a container by question ID.
 * Uses data-question-id attribute to find the target element.
 * 
 * @param container - The scrollable container ref
 * @param questionId - The question ID to scroll to
 * @param options - Scroll options
 */
export function scrollToQuestionInContainer(
  container: React.RefObject<HTMLElement | null> | HTMLElement | null,
  questionId: number,
  options: {
    behavior?: ScrollBehavior;
    block?: 'start' | 'center' | 'end';
    offset?: number;
  } = {}
): void {
  const containerEl = container && 'current' in container ? container.current : container;
  if (!containerEl) return;

  const element = containerEl.querySelector<HTMLElement>(`[data-question-id="${questionId}"]`);
  scrollToElementInContainer(containerEl, element, options);
}
