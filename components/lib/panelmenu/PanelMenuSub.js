import React, { useState, createRef, memo } from 'react';
import { CSSTransition } from '../csstransition/CSSTransition';
import { ObjectUtils, classNames } from '../utils/Utils';
import { useMountEffect } from '../hooks/Hooks';

export const PanelMenuSub = memo((props) => {
    const [activeItemState, setActiveItemState] = useState(null);

    const findActiveItem = () => {
        if (props.model) {
            if (props.multiple) {
                return props.model.filter(item => item.expanded);
            }
            else {
                let activeItem = null;
                props.model.forEach(item => {
                    if (item.expanded) {
                        if (!activeItem)
                            activeItem = item;
                        else
                            item.expanded = false;
                    }
                });

                return activeItem;
            }
        }

        return null;
    }

    const onItemClick = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (!item.url) {
            event.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: event,
                item
            });
        }

        let activeItem = activeItemState;
        let active = isItemActive(item);

        if (active) {
            item.expanded = false;
            setActiveItemState(props.multiple ? activeItem.filter(a_item => a_item !== item) : null)
        }
        else {
            if (!props.multiple && activeItem) {
                activeItem.expanded = false;
            }

            item.expanded = true;
            setActiveItemState(props.multiple ? [...(activeItem || []), item] : item)
        }
    }

    const isItemActive = (item) => {
        return activeItemState && (props.multiple ? activeItemState.indexOf(item) > -1 : activeItemState === item);
    }

    useMountEffect(() => {
        setActiveItemState(findActiveItem());
    });

    const useSeparator = (index) => {
        const key = 'separator_' + index;

        return <li key={key} className="p-menu-separator"></li>
    }

    const useSubmenu = (item, active) => {
        const className = classNames('p-toggleable-content', {
            'p-toggleable-content-collapsed': !active
        });
        const submenuRef = createRef();

        if (item.items) {
            return (
                <CSSTransition nodeRef={submenuRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit>
                    <div ref={submenuRef} className={className}>
                        <PanelMenuSub model={item.items} multiple={props.multiple} />
                    </div>
                </CSSTransition>
            );
        }

        return null;
    }

    const useMenuItem = (item, index) => {
        const key = item.label + '_' + index;
        const active = isItemActive(item);
        const className = classNames('p-menuitem', item.className);
        const linkClassName = classNames('p-menuitem-link', { 'p-disabled': item.disabled });
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const submenuIconClassName = classNames('p-panelmenu-icon pi pi-fw', { 'pi-angle-right': !active, 'pi-angle-down': active });
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const submenuIcon = item.items && <span className={submenuIconClassName}></span>;
        const submenu = useSubmenu(item, active);
        let content = (
            <a href={item.url || '#'} className={linkClassName} target={item.target} onClick={(event) => onItemClick(event, item, index)} role="menuitem" aria-disabled={item.disabled}>
                {submenuIcon}
                {icon}
                {label}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item, index),
                className: linkClassName,
                labelClassName: 'p-menuitem-text',
                iconClassName,
                submenuIconClassName,
                element: content,
                props,
                leaf: !item.items,
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li key={key} className={className} style={item.style} role="none">
                {content}
                {submenu}
            </li>
        )
    }

    const useItem = (item, index) => {
        return item.separator ? useSeparator(index) : useMenuItem(item, index);
    }

    const useMenu = () => {
        return props.model ? props.model.map(useItem) : null;
    }

    const className = classNames('p-submenu-list', props.className);
    const menu = useMenu();

    return (
        <ul className={className} role="tree">
            {menu}
        </ul>
    )
});
