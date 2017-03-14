---
Type: doc
Title: Component
Order: 15
---

A component is an object for handling the functions attached to a node independently.
The component belongs to one node of the GomlNode on the tree, and receives a message from the node and operates.

# Name
The name of this component
# Attributes
A list of attributes for this component.
# Node
The node to which this component belongs
# Element
The dom element corresponding to this component
# IsDefaultComponent
Determine whether this component is the default component.
# Enabled
Set and get validity/invalidity of component.
# Companion
This node's companion of this component. See GomlNode.
# Tree
The tree of nodes of this component. See GomlNode.
# GetValue
Retrieve the attribute value.
# GetAttribute
Get the attribute.
# RemoveEnabledObserver
Delete the observer added with addEnabledObserver.
# AddEnabledObserver
Register the observer to be notified of the change of enabled.
# ResolveDefaultAttributes
It is used in the system. **Please do not use**.
# __addAtribute
** Used internally when implementing custom components. **
Add an attribute to this component.
# __removeAttributes
** Used internally when implementing custom components. **
Removes an attribute from this component.
